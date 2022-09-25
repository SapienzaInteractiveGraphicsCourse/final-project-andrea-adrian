import { Renderer } from './Renderer.js';
import { SceneManager } from './SceneManager.js';
import { GameManager } from './GameManager.js';
import * as THREE from './resources/libs/three/build/three.module.js';

import { Animations } from './Animations.js';

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
  
  gameManager.playerAnimations = new Animations();
  gameManager.botAnimations = new Animations();

  const clock = new THREE.Clock();

  sceneManager.onLoadFinished = gameManager.initPhysics.bind(gameManager);
  
  sceneManager.loadCourt();
  sceneManager.loadBall();
  sceneManager.loadPlayers();
  sceneManager.loadLights();  
  
  let cameraControls, playerControls;

  function start(){
    // create camera controls
    cameraControls = createCameraControls(renderer.getCamera(), canvas);

    playerControls = createPlayerControls();

    document.addEventListener('keydown', playerControls.handleInput.bind(playerControls));
    document.addEventListener('keyup', playerControls.handleInput.bind(playerControls));

    gameManager.playerController = playerControls;
    gameManager.setPose();

    requestAnimationFrame(render);
  }

  function render() {
    //gameManager.setPose();
    const deltaTime = clock.getDelta();

    gameManager.updateState(deltaTime, ballHitSound, matchSound);
    cameraControls.update();
    
    renderer.update(deltaTime);

    requestAnimationFrame(render);
  }
};

main();