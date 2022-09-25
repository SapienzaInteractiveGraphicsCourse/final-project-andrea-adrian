import { PlayerController } from './PlayerController.js';
import { OrbitControls } from './resources/libs/controls/OrbitControls.js';

function createCameraControls(camera, canvas){
  const controls = new OrbitControls(camera, canvas);
  
  controls.enableDamping = true;

  return controls;
}

function createPlayerControls(){
  return new PlayerController();
}

export { createCameraControls, createPlayerControls };