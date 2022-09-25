import { Renderer } from './Renderer.js';
import { SceneManager } from './SceneManager.js';
import { GameManager } from './GameManager.js';
import * as THREE from './resources/libs/three/build/three.module.js';

import TWEEN from './resources/libs/tween/build/tween.esm.js';

import { createCameraControls, createPlayerControls } from './controls.js';

function main() {
  // three initializations
  const canvas = document.querySelector('#c');
  const sceneManager = new SceneManager();
  const renderer = new Renderer(canvas, sceneManager.getScene());
  
  renderer.renderer.shadowMap.enabled = true;
  renderer.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const listener = new THREE.AudioListener();
  renderer.getCamera().add(listener);
  const audioLoader = new THREE.AudioLoader();
  let audio = localStorage.audio ? localStorage.audio : 1;
  
  const matchSound = new THREE.Audio(listener);
  audioLoader.load("./resources/assets/sounds/match.mp3", function(buffer){
    matchSound.setBuffer(buffer);
    matchSound.setLoop(false);
    matchSound.setVolume(audio * 0.1);
  });

  const ballHitSound = new THREE.Audio(listener);
  audioLoader.load("./resources/assets/sounds/ball_hit.mp3", function(buffer){
    ballHitSound.setBuffer(buffer);
    ballHitSound.setLoop(false);
    ballHitSound.setVolume(audio * 0.25);
  });

  
  const gameManager = new GameManager();
  gameManager.onLoadFinished = start;

  const clock = new THREE.Clock();

  sceneManager.onLoadFinished = gameManager.initPhysics.bind(gameManager);
  
  sceneManager.loadCourt();
  sceneManager.loadBall();
  sceneManager.loadPlayers();
  sceneManager.loadLights();

  var ball = sceneManager.models[1]
  var p1 = sceneManager.models[2];
  var p2 = sceneManager.models[3];
  
  var tween1 = new TWEEN.Tween({x:0, y:2, z:0})
  .to({x:5, y:0, z:0},2000)
  .onUpdate((coords) => {
    ball.position.x = coords.x;
    ball.position.y = coords.y;
    ball.position.z = coords.z;
  })
  .easing(TWEEN.Easing.Quadratic.Out)
  .repeat(5)
  .delay(1000);
  tween1.start();

  var tween2 = new TWEEN.Tween({x:8, y:2, z:0})
  .to({x:5, y:2, z:0},2000)
  .onUpdate((coords) => {
    p1.position.x = coords.x;
    p1.position.y = coords.y;
    p1.position.z = coords.z;
  })
  .easing(TWEEN.Easing.Quadratic.Out)
  .repeat(5)
  .delay(500);
  tween2.start();

  var tween3 = new TWEEN.Tween({x:-8, y:2, z:0})
  .to({x:-5, y:2, z:0},2000)
  .onUpdate((coords) => {
    p2.position.x = coords.x;
    p2.position.y = coords.y;
    p2.position.z = coords.z;
  })
  .easing(TWEEN.Easing.Quadratic.Out)
  .repeat(5)
  .delay(500);
  tween3.start();

  let cameraControls, playerControls;

  function start(){
    // create camera controls
    cameraControls = createCameraControls(renderer.getCamera(), canvas);

    playerControls = createPlayerControls();

    document.addEventListener('keydown', playerControls.handleInput.bind(playerControls));
    document.addEventListener('keyup', playerControls.handleInput.bind(playerControls));

    gameManager.playerController = playerControls;

    requestAnimationFrame(render);
    
  }

  function render() {
    const deltaTime = clock.getDelta();

    gameManager.updateState(deltaTime, ballHitSound, matchSound);
    cameraControls.update();
    
    renderer.update(deltaTime);
    //TWEEN.update();

    requestAnimationFrame(render);
  }
};

main();