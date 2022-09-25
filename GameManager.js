import { PhysicsEngine } from './Physics.js';
import { KFRAMES, BONE_NAMES } from './Animations.js';
import * as THREE from './resources/libs/three/build/three.module.js';

class GameManager {
  gameEntities = {};
  shotBall1 = false;
  shootingForce = 0;
  reset = false;

  ballServe = 2; // 1 = player 1, 2 = player 2, 0 no one can serve
  lastTouch = 0; // 1 = player 1, 2 = player 2, 0 no one touched the ball
  justServed = false;

  playerController;
  onLoadFinished;

  accumForce = {x: 0, y: 0, z: 0};
  FORCE_INCREASE = 0.1;

  playerAnimations;

  constructor() {
    if(!GameManager.instance) {
      GameManager.instance = this;
      this.state = new GameState();
      this.state.onGameFinished = this.resetGame.bind(this);
      this.physEngine = new PhysicsEngine();

    }
    return GameManager.instance;
  }

  // called by SceneManager as a callback
  // the callback is set in game.js
  initPhysics(models){
    models.forEach(model => {
      this.gameEntities[model.name] = model;
    });

    console.log(models);

    this.playerAnimations.setBones(this.gameEntities.player2.bones);

    this.physEngine.onLoadFinished = this.onPhysicsLoadFinished.bind(this);
    this.physEngine.onBallCollision = this.onBallContact.bind(this);

    this.physEngine.initPhysics();
  }

  onPhysicsLoadFinished(rigidBodies, firstTime=true){
    this.updateRigidBodies(rigidBodies);

    if(firstTime){
      this.onLoadFinished();
    }
  }

  setPose(){
    // set default pose
    const defVec = new THREE.Vector3(
      KFRAMES.default.positions['spineX'],
      KFRAMES.default.positions['spineY'],
      KFRAMES.default.positions['spineZ']
    )

    this.gameEntities.player2.bones.getObjectByName('spine').position.set(defVec.x, defVec.y, defVec.z);

    for(let [key, boneName] of Object.entries(BONE_NAMES)) {
      const defQuaternion = new THREE.Quaternion(
        KFRAMES.default.rotations[boneName+'X'],
        KFRAMES.default.rotations[boneName+'Y'],
        KFRAMES.default.rotations[boneName+'Z'],
        KFRAMES.default.rotations[boneName+'W']
      )

      if(key === 'thigh_L'){
        const offset = new THREE.Quaternion().setFromAxisAngle({x:0,y:0,z:1}, -this.playerController.OFFSET_VALUE);
        
        let result = defQuaternion.multiply(offset);
        console.log(result);

        this.gameEntities.player2.bones.getObjectByName(key).quaternion.copy(result);
      } else {
        this.gameEntities.player2.bones.getObjectByName(key).quaternion.copy(defQuaternion);
      }
    }
  }

  updateRigidBodies(rigidBodies) {
    for (let [key, entity] of Object.entries(this.gameEntities)){
      key = key.replace('_debug', '');
      key = key.replace('_circle', '');
      if(entity)
        entity.userData.physicsBody = rigidBodies[key];
    }
  }

  updateState(deltaTime, ballHitSound, matchSound){
    this.playerAnimations.update(deltaTime);
    
    if(!this.reset) {
      for (const [key, val] of Object.entries(this.gameEntities)){
        if(!val || !val.userData.physicsBody){
          //console.log("no physics body for " + key);
          continue;
        }

        let objThree = val;
        let objAmmo = objThree.userData.physicsBody;

        if(val.name === "player2" || val.name === "player2_box"){
          let vel = this.playerController.getPlayerVelocity();

          let ammoVel = objAmmo.getLinearVelocity(); // get current velocity

          if(vel.x != 0 || vel.z != 0){
            this.playerAnimations.stopAnimation('idle');

            if(vel.z > 0){
              this.playerAnimations.startAnimation('walkRight');
            } else if(vel.z < 0){
              this.playerAnimations.startAnimation('walkLeft');
            } else {
            this.playerAnimations.startAnimation('walk'); 
            }
          
          } else {
            this.playerAnimations.stopAnimation('walkLeft');
            this.playerAnimations.stopAnimation('walkRight');
            this.playerAnimations.stopAnimation('walk');
            this.playerAnimations.startAnimation('idle');
          }

          ammoVel.setX(-vel.x);
          ammoVel.setY(0);
          ammoVel.setZ(vel.z);
        }
        else if(val.name === "ball"){
          const distance = this.getBallDistanceFromPlayer('player2');
          
          if(this.playerController.isShooting()){
            this.shotBall1 = true;
            this.accumForce.x += this.FORCE_INCREASE;
            this.accumForce.y += 0.5 * this.FORCE_INCREASE;
          } else if(this.shotBall1) {
            this.shotBall1 = false;

            this.playerAnimations.startAnimation('shoot');
            if(distance < 2.0 || this.ballServe == 2 && !this.justServed) {
              // shoot ball
              //console.log('shooting');
              this.lastTouch = 1;
              ballHitSound.play();
              this.physEngine.shootBall(this.accumForce, this.ballServe);

              if(this.ballServe == 2) {
                this.justServed = true;
              }

            }
            this.accumForce = {x: 0, y: 0, z: 0};
          }
        }

        let transform = this.physEngine.getTransform(objAmmo);
        let p = transform.getOrigin();
        let q = transform.getRotation();
        
        if(val.name === "player2_circle"){
          objThree.position.set( p.x(), 1.2, p.z() );
          const rad = 0.3 * this.accumForce.x;
          objThree.scale.set(rad, rad, 1.0);
        } else {
          if(objThree.offset)
            objThree.position.set( p.x() + objThree.offset.x, p.y() + objThree.offset.y, p.z() + objThree.offset.z );
          else
            objThree.position.set( p.x(), p.y(), p.z() );
        }
        objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );
      }

      this.physEngine.update(deltaTime,matchSound);
    } else {
      this.reset = false;
      console.log("RESET");
      this.physEngine.reset();
      if(this.state.getWinner() != 0) this.state.reset();
    }
  }

  resetGame() {
    // called by gamestate when a player wins
    this.reset = true;
  }

  /*
    * Called by PhysicsEngine when a ball collision is detected
    * inOut indicates whether the ball is inside or outside the playing field
    * botOrPlayer indicates whether the ball is on the bot or the player's side
  */
  onBallContact(inOut, botOrPlayer, matchSound){
    this.justServed = false;

    if(inOut == 'in' && botOrPlayer=="bot" || inOut == 'out' && this.lastTouch != 1){
      this.state.updateScore(PLAYERS.PLAYER_1);
      this.reset = true;
      this.lastTouch = 0;
    }
    else {
      this.state.updateScore(PLAYERS.PLAYER_2);
      this.reset = true;
      this.lastTouch = 0;
    }
    this.updateScoreTable();
    matchSound.play();
    
  }

  updateScoreTable(){
    var score = [this.state.getScore()[0], this.state.getScore()[1]];
    if(score[0] == 40 && score[1] == 40 && this.state.getAdvantage()[0]) score[0] = "V";
    if(score[0] == 40 && score[1] == 40 && this.state.getAdvantage()[1]) score[1] = "V";
    var name = localStorage.name ? localStorage.name : "Player";
    var names = [name, "A.I."];
    for(var i=0;i<2;i++){
      var r = document.getElementsByClassName('riga');
      r[i].innerHTML = '<div class="ter"><div class="prev">'+this.state.getPrevious()[0][i]+'</div><div class="prev">'+this.state.getPrevious()[1][i]+'</div></div><div class="ter"><div class="play">'+names[i]+'</div></div><div class="ter"><div class="set">'+this.state.getSetsWon()[i]+'</div><div class="set game">'+this.state.getPoints()[i]+'</div><div class="point">'+score[i]+'</div></div>';
    }
    if(this.state.getWinner() != 0){
      document.getElementsByClassName('play')[2].innerHTML = names[this.state.getWinner() - 1];
      document.getElementsByTagName('p')[0].style.display = 'block';
    }
    else{
      document.getElementsByClassName('play')[2].innerHTML = "";
      document.getElementsByTagName('p')[0].style.display = 'none';
    }
    
  }

  getBallDistanceFromPlayer(playerName){
    let player = this.gameEntities[playerName];
    let ball = this.gameEntities.ball;

    let p1 = player.position;
    let p2 = ball.position;

    let distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.z - p2.z, 2));

    return distance;
  }
}

class GameState {
  onGameFinished;

  constructor() {
    this.gameState = {};
    this.reset();
  }

  reset(){
    this.gameState.score = [0, 0];
    this.gameState.advantage = [false,false];
    this.gameState.points = [0, 0];
    this.gameState.setsWon = [0, 0];
    this.gameState.previous = [[0,0],[0,0]];
    this.gameState.winner = 0;
  }

  updateScore(scoringPlayer) {
    let score1 = this.gameState.score[0];
    let score2 = this.gameState.score[1];
    let adv1 = this.gameState.advantage[0];
    let adv2 = this.gameState.advantage[1];
    if(scoringPlayer === PLAYERS.PLAYER_1) {
      if(score1 < 30) this.gameState.score[0] += 15;
      else if(score1 == 30) this.gameState.score[0] += 10;
      else if(score1 == 40 && (score2 < 40 || score2 == 40 && adv1 == true && adv2 == false)){
        this.updatePoints(scoringPlayer);
      }
      else if(score1 == 40 && score2 == 40 && adv1 == false && adv2 == false) this.gameState.advantage[0] = true;
      else this.gameState.advantage[1] = false;
    }
    else {
      if(score2 < 30) this.gameState.score[1] += 15;
      else if(score2 == 30) this.gameState.score[1] += 10;
      else if(score2 == 40 && (score1 < 40 || score1 == 40 && adv2 == true && adv1 == false)){
        this.updatePoints(scoringPlayer);
      }
      else if(score2 == 40 && score1 == 40 && adv2 == false && adv1 == false) this.gameState.advantage[1] = true;
      else this.gameState.advantage[0] = false;
    }

  }

  updatePoints(scoringPlayer){
    let point1 = this.gameState.points[0];
    let point2 = this.gameState.points[1];
    if(scoringPlayer === PLAYERS.PLAYER_1) {
      this.gameState.score[0] = 0;
      this.gameState.score[1] = 0;
      this.gameState.advantage[0] = false;
      this.gameState.advantage[1] = false;
      if(point1 < 5 || (point1==5 && point2 >= 5)) this.gameState.points[0] += 1;
      else {
        if (this.gameState.setsWon[0] == 0 && this.gameState.setsWon[1] == 0){
          this.gameState.previous[0][0] = this.gameState.points[0] + 1;
          this.gameState.previous[0][1] = this.gameState.points[1];
        }
        else if(this.gameState.setsWon[0] == 0 && this.gameState.setsWon[1] == 1){
          this.gameState.previous[1][0] = this.gameState.points[0] + 1;
          this.gameState.previous[1][1] = this.gameState.points[1];
        }
        this.gameState.setsWon[0] += 1;
        this.gameState.points[0] += 1;
        if(this.gameState.setsWon[0] < 2){
          this.gameState.points[0] = 0;
          this.gameState.points[1]= 0;
        }
        else this.gameState.winner = 1;
      }
    }
    else{
      this.gameState.score[0] = 0;
      this.gameState.score[1] = 0;
      this.gameState.advantage[0] = false;
      this.gameState.advantage[1] = false;
      if(point2 < 5 || (point2==5 && point1 >= 5)) this.gameState.points[1] += 1;
      else {
        if (this.gameState.setsWon[0] == 0 && this.gameState.setsWon[1] == 0){
          this.gameState.previous[0][0] = this.gameState.points[0];
          this.gameState.previous[0][1] = this.gameState.points[1] + 1;
        }
        else if(this.gameState.setsWon[0] == 1 && this.gameState.setsWon[1] == 0){
          this.gameState.previous[1][0] = this.gameState.points[0];
          this.gameState.previous[1][1] = this.gameState.points[1] + 1;
        }
        this.gameState.setsWon[1] += 1;
        this.gameState.points[1] += 1;
        if(this.gameState.setsWon[1] < 2){
          this.gameState.points[0] = 0;
          this.gameState.points[1] = 0;
        }
        else this.gameState.winner = 2;
      }
    }
  }

  getScore() {
    return this.gameState.score;
  }
  getAdvantage(){
    return this.gameState.advantage;
  }
  getPoints(){
    return this.gameState.points;
  }
  getSetsWon() {
    return this.gameState.setsWon;
  }
  getPrevious(){
    return this.gameState.previous;
  }
  getWinner(){
    return this.gameState.winner;
  }
}

const PLAYERS = {
  PLAYER_1: 1,
  PLAYER_2: 2
}

export {GameManager};