import * as THREE from './resources/libs/three/build/three.module.js';
import {GLTFLoader} from './resources/libs/loaders/GLTFLoader.js';
import {ColladaLoader} from './resources/libs/loaders/ColladaLoader.js';


class SceneManager {
  models = [];
  player_bones = null;
  counter = 0;
  modelsToLoad = 6;
  onLoadFinished;

  constructor() {
    if(!SceneManager.instance) {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xFFFFFF);
      this.modelLoader = new GLTFLoader();
      this.player_modelLoader = new ColladaLoader();
    } else {
      return SceneManager.instance;
    }
  }

  progressLoading() {
    if(this.models.length === this.modelsToLoad){
      if(this.onLoadFinished) this.onLoadFinished(this.models);
    }
  }

  loadLights(){
    const color = 0xFFFFFF;
    const intensity = 1.3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 30, 0);
    light.castShadow = true;

    light.shadow.camera.left = -22
    light.shadow.camera.right = 22
    light.shadow.camera.top = 22
    light.shadow.camera.bottom = -22
    light.shadow.camera.near = 20
    light.shadow.camera.far = 40
    light.shadow.mapSize.width = 2048
    light.shadow.mapSize.height = 2048

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.3);
    this.scene.add(light);
    this.scene.add(ambientLight);
  }

  loadCourt(){
    this.modelLoader.load('./resources/assets/models/court.glb', (model) => {
      model.scene.traverse(function (node) {
        if (node.isMesh || node.isLight) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });

      const court = model.scene.children[0];
      court.name = "court";
      court.scale.set(1.8,1.8,1.8);

      this.scene.add(court);
      this.models.push(court);

      this.progressLoading();

    }, undefined, (error) => {
      console.error(error);
    }
    );
  }

  loadPlayers(){
    this.player_modelLoader.load("./resources/assets/models/Player/player.dae", (player) => {
      player.scene.traverse(function (node) {
        if (node.isMesh || node.isLight) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
      let scale = {x: 3.5, y: 2, z: 3};
      
      //player.scene.rotateY(Math.PI/2);
      
      player.scene.offset = {x: 0, y: 0.5, z: 0};
      player.scene.scale.set(2,2,2);
      player.scene.name = "player2";
      console.log(player.scene);

      
      player.scene.bones = player.scene.getObjectByName("spine");
      //player.scene.bones.up = new THREE.Vector3(0, 0, -1);

      player.scene.traverse(child => {
        if (child.isMesh) {
          const material = new THREE.MeshPhongMaterial({
            color: 0x3355FF,    // blue
          });
          child.material = material;
        }
      });

      // add circle at player feet for shoot charging
      let circle = new THREE.Mesh(new THREE.CircleBufferGeometry(1, 32), new THREE.MeshPhongMaterial({color: 0xff0000}));
      circle.material.transparent = true;
      circle.material.opacity = 0.5;
      circle.name = "player2_circle";
      
      this.scene.add(circle);
      this.models.push(circle);

      // DEBUG

      // player
      const newcube = new THREE.Mesh(new THREE.BoxBufferGeometry(scale.x, scale.y, scale.z), new THREE.MeshPhongMaterial({color: 0x00FF00}));

      newcube.name = "player2_debug";
      newcube.material.transparent = true;
      newcube.material.opacity = 0.5;

      this.models.push(newcube);
      this.models.push(player.scene);
      
      this.scene.add(newcube);
      this.scene.add(player.scene);

      this.progressLoading();
    });
  }

  loadBall(){
    this.modelLoader.load("./resources/assets/models/Ball/Ball.gltf", (model) =>{
      model.scene.traverse(function (node) {
        if (node.isMesh || node.isLight) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });

      const ball = model.scene.children[0];
      ball.scale.set(0.1,0.1,0.1);
      ball.position.set(0,2,0);
      ball.name = "ball";

      this.models.push(ball);
      this.scene.add(ball);

      // DEBUG
      let newsphere = new THREE.Mesh(new THREE.SphereBufferGeometry(0.1), new THREE.MeshPhongMaterial({color: 0x0000FF}));
      newsphere.position.set(0,2,0);

      newsphere.material.transparent = true;
      newsphere.material.opacity = 0.5;

      newsphere.name = "ball_debug";

      this.scene.add(newsphere);
      this.models.push(newsphere);

      this.progressLoading();
    });
  }

  getScene() {
    return this.scene;
  }
}

export {SceneManager};