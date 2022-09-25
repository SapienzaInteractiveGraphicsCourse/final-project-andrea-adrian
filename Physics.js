import AmmoLib from './resources/libs/ammo/build/ammo.js';
const STATE = { DISABLE_DEACTIVATION : 4 }

class PhysicsEngine {
  rigidBodies = {
    bot:null,
    player2:null,
    ball:null,
    court:null,
    net:null,
    wall_top: null,
    wall_bot: null,
    wall_left: null,
    wall_right: null
  };
  
  tmpTransf;
  tmpVec3;
  tmpQuat;
  zeroVec;
  cbContactResult;
  
  ammo;

  onLoadFinished;
  onBallCollision;

  constructor(){
    if(!PhysicsEngine.instance){
      PhysicsEngine.instance = this;

      // ammo initializations
      AmmoLib().then( ammoRef => { this.init(ammoRef) }, error => {
        console.error(error);
      } );

    } else {
      return PhysicsEngine.instance;
    }
  }

  init(ammoRef) {
    this.ammo = ammoRef;
  }

  initPhysics(){
    let collisionConfiguration  = new this.ammo.btDefaultCollisionConfiguration();
    let dispatcher              = new this.ammo.btCollisionDispatcher(collisionConfiguration);
    let overlappingPairCache    = new this.ammo.btDbvtBroadphase();
    let solver                  = new this.ammo.btSequentialImpulseConstraintSolver();
    this.physicsWorld           = new this.ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);

    this.physicsWorld.setGravity(new this.ammo.btVector3(0, -10, 0));
    this.tmpTrans = new this.ammo.btTransform();
    this.tmpVec3 = new this.ammo.btVector3( 0, 0, 0 );
    this.tmpQuat = new this.ammo.btQuaternion( 0, 0, 0, 1 );
    this.zeroVec = new this.ammo.btVector3( 0, 0, 0 );

    this.setupContactResultCallback();

    this.createCourtPlane();
    this.createBall();
    this.createPlayers();
    this.createNet();
    this.createWalls();
    
    this.onLoadFinished(this.rigidBodies);
  }

  createCourtPlane(){
    let pos = {x: 0, y: 0.8, z: 0};
    let scale = {x: 45, y: 0.6, z: 40};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;

    let body = this.buildBody(pos, scale, quat, mass);
    body.setRestitution(0.8);
    body.setActivationState(STATE.DISABLE_DEACTIVATION);
    body.tag = "court";
    body.setAngularFactor( 0, 0, 0 );

    this.physicsWorld.addRigidBody(body);
    this.rigidBodies.court = body;
  }

  createWalls(){
    // WALL TOP
    let pos = {x: 21.5, y: 0, z: 0};
    let scale = {x: .5, y: 100, z: 30};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;

    let body = this.buildBody(pos, scale, quat, mass);
    body.setActivationState(STATE.DISABLE_DEACTIVATION);
    body.tag = "wall";

    this.physicsWorld.addRigidBody(body);
    this.rigidBodies.wall_top = body;

    // WALL BOTTOM 
    pos = {x: -21.5, y: 0, z: 0};

    body = this.buildBody(pos, scale, quat, mass);
    body.setActivationState(STATE.DISABLE_DEACTIVATION);
    body.tag = "wall";

    this.physicsWorld.addRigidBody(body);
    this.rigidBodies.wall_bot = body;

    // WALL LEFT
    pos = {x: 0, y: 0, z: -12};
    scale = {x: 43, y: 10, z: 0.5};

    body = this.buildBody(pos, scale, quat, mass);
    body.setActivationState(STATE.DISABLE_DEACTIVATION);
    body.tag = "wall";

    this.physicsWorld.addRigidBody(body);
    this.rigidBodies.wall_left = body;

    // WALL RIGHT
    pos = {x: 0, y: 0, z: 12};

    body = this.buildBody(pos, scale, quat, mass);
    body.setActivationState(STATE.DISABLE_DEACTIVATION);
    body.tag = "wall";

    this.physicsWorld.addRigidBody(body);
    this.rigidBodies.wall_right = body;

  }

  createBall(pos={x: 0, y: 0, z: 0}){
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 1;
    let dimensions = {radius: 0.1};

    let body = this.buildBody(pos, dimensions, quat, mass, "sphere");
    body.setRestitution(0.8);
    body.setActivationState(STATE.DISABLE_DEACTIVATION);
    body.tag = "ball";

    this.physicsWorld.addRigidBody( body );
    this.rigidBodies.ball = body;
  }

  createNet(){
    let pos = {x: 0, y: 1.75, z: 0};
    let scale = {x: .5, y: 1.75, z: 17};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;

    let body = this.buildBody(pos, scale, quat, mass);
    body.setActivationState(STATE.DISABLE_DEACTIVATION);
    body.tag = "net";

    this.physicsWorld.addRigidBody(body);
    this.rigidBodies.net = body;
  }

  createPlayers(){
    const k = 0.5; // 0.7071067811865475;
    let player_pos = {x: -8, y: 2, z: 0};
    let scale = {x: 3.5, y: 2, z: 3};
    let quat = {x: k, y: k, z: k, w: -k};
    let mass = 100;

    // bot
    let bot_pos = {x: 14, y: 2, z: 0};
    let body = this.buildBody(bot_pos, scale, quat, mass);
    body.setFriction(0);
    body.setRollingFriction(0);
    body.setActivationState(STATE.DISABLE_DEACTIVATION);
    body.setAngularFactor( 0, 0, 0 );
    body.tag = "bot";

    this.physicsWorld.addRigidBody(body);
    this.rigidBodies.bot = body;

    // player
    quat = {x: -k, y: k, z: k, w: k};

    body = this.buildBody(player_pos, scale, quat, mass);

    body.setFriction(0);
    body.setRollingFriction(0);
    body.setActivationState(STATE.DISABLE_DEACTIVATION);
    body.setAngularFactor( 0, 0, 0 );
    body.tag = "player";

    this.physicsWorld.addRigidBody(body);
    this.rigidBodies.player2 = body;
  }

  buildBody(pos, dimensions, quat, mass, shape="cube"){
    let transform = new this.ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new this.ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new this.ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new this.ammo.btDefaultMotionState( transform );

    let colShape;
    if(shape == "cube"){
      colShape = new this.ammo.btBoxShape( new this.ammo.btVector3( dimensions.x * 0.5, dimensions.y * 0.5, dimensions.z * 0.5 ) );
    } else if(shape == "sphere"){
      colShape = new this.ammo.btSphereShape( dimensions.radius * 0.5 );
    }
    colShape.setMargin( 0.05 );

    let localInertia = new this.ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new this.ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    return new this.ammo.btRigidBody( rbInfo );
  }

  setupContactResultCallback(){
    this.cbContactResult = new this.ammo.ConcreteContactResultCallback();
  
    this.cbContactResult.addSingleResult = function(cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1){
      let contactPoint = this.ammo.wrapPointer( cp, this.ammo.btManifoldPoint );
  
      const distance = contactPoint.getDistance();
  
      if( distance > 0 ) return;
  
      let colWrapper0 = this.ammo.wrapPointer( colObj0Wrap, this.ammo.btCollisionObjectWrapper );
      let rb0 = this.ammo.castObject( colWrapper0.getCollisionObject(), this.ammo.btRigidBody );
  
      let colWrapper1 = this.ammo.wrapPointer( colObj1Wrap, this.ammo.btCollisionObjectWrapper );
      let rb1 = this.ammo.castObject( colWrapper1.getCollisionObject(), this.ammo.btRigidBody );
  
      let threeObject0 = rb0.threeObject;
      let threeObject1 = rb1.threeObject;
  
      let tag, localPos, worldPos
  
      if( threeObject0.userData.tag != "ball" ){
        tag = threeObject0.userData.tag;
        localPos = contactPoint.get_m_localPointA();
        worldPos = contactPoint.get_m_positionWorldOnA();
  
      }
      else{
        tag = threeObject1.userData.tag;
        localPos = contactPoint.get_m_localPointB();
        worldPos = contactPoint.get_m_positionWorldOnB();
  
      }

      let localPosDisplay = {x: localPos.x(), y: localPos.y(), z: localPos.z()};
      let worldPosDisplay = {x: worldPos.x(), y: worldPos.y(), z: worldPos.z()};
  
      console.log( { tag, localPosDisplay, worldPosDisplay } );
  
    }
  
  }

  shootBall(force, serve){
    // serve: 0 no one, 1 player_1, 2 player_2
    if(serve === 2) {
      console.log("Serving")
      const player_position = this.getTransform(this.rigidBodies.player2).getOrigin();
      
      let pos = {x: player_position.x()+2, y: 4, z: player_position.z()};
      
      this.createBall(pos);
      this.onLoadFinished(this.rigidBodies, false);      
    }

    const body = this.rigidBodies.ball;
    this.tmpVec3.setValue(force.x, force.y, force.z); // relative force
    const transform = this.getTransform(body);

    const relForce = this.tmpVec3;
    
    body.applyImpulse(relForce, transform.getOrigin());
  }

  detectBallCollision(matchSound){
    const dispatcher = this.physicsWorld.getDispatcher();
    const numManifolds = dispatcher.getNumManifolds();

    for (let i = 0; i < numManifolds; i++) {
      const contactManifold = dispatcher.getManifoldByIndexInternal(i);
      const numContacts = contactManifold.getNumContacts();
      
      for (let j = 0; j < numContacts; j++) {
        const contactPoint = contactManifold.getContactPoint(j);
        const distance = contactPoint.getDistance();
        
        if (distance < 0.0001) {        
          const rb0 = this.ammo.castObject(contactManifold.getBody0(), this.ammo.btRigidBody);
          const rb1 = this.ammo.castObject(contactManifold.getBody1(), this.ammo.btRigidBody);
          const worldPos = contactPoint.getPositionWorldOnA();
          
          if( rb0.tag == "ball" || rb1.tag == "ball" ){
            const fieldPos = worldPos.x() > 0 ? "bot" : "player";
            
            // check if ball is out
            if( Math.abs(worldPos.x()) > 14 || 
            Math.abs(worldPos.z()) > 5 ){
              this.onBallCollision('out', fieldPos, matchSound);
            } else {
              this.onBallCollision('in', fieldPos, matchSound);
            }
          }
        }
      }
    }
  }

  getVector(vec){
    this.tmpVec3.setX(vec.x);
    this.tmpVec3.setY(vec.y);
    this.tmpVec3.setZ(vec.z);

    return this.tmpVec3;
  }

  getQuaternion(quat){
    this.tmpQuat.setX(quat.x);
    this.tmpQuat.setY(quat.y);
    this.tmpQuat.setZ(quat.z);
    this.tmpQuat.setW(quat.w);

    return this.tmpQuat;
  }

  getTransform(objAmmo){
    let ms = objAmmo.getMotionState();
    if(ms){
      ms.getWorldTransform( this.tmpTrans );
    } else {
      this.tmpTrans = null;
    } 
    
    return this.tmpTrans;
  }

  update(deltaTime, matchSound){
    if(this.physicsWorld){
      this.physicsWorld.stepSimulation(deltaTime, 10);
      this.detectBallCollision(matchSound);
    }
  }

  reset(){
    this.physicsWorld.removeRigidBody( this.rigidBodies.ball );
  }
}

export {PhysicsEngine};