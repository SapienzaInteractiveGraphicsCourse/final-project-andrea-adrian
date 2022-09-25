import * as THREE from './resources/libs/three/build/three.module.js';
import { EffectComposer, EffectPass, RenderPass, HueSaturationEffect, BrightnessContrastEffect, SMAAEffect} from "./resources/libs/postprocessing/postprocessing.esm.js";

function calcViewport(width, height) {
  var w = width;
  var h = height;
  var viewSize = h;
  var aspectRatio = w / h;

  const viewport = {
    viewSize: viewSize,
    aspectRatio: aspectRatio,
    left: (-aspectRatio * viewSize) / 2,
    right: (aspectRatio * viewSize) / 2,
    top: viewSize / 2,
    bottom: -viewSize / 2,
    near: -100,
    far: 100
  }

  return viewport;
}

class Renderer {
  constructor(canvas, scene){
    if(!Renderer.instance) {
      Renderer.instance = this;
      this.scene = scene;
      this.canvas = canvas;
      this.renderer = new THREE.WebGLRenderer({canvas:canvas, powerPreference: "high-performance",
        antialias: false,
        stencil: false,
        depth: false});
      this.renderer.setClearColor(0x000000, 0.0);

      this.viewport = calcViewport(this.canvas.clientWidth, this.canvas.clientHeight);

      this.camera = new THREE.OrthographicCamera ( 
        this.viewport.left, 
        this.viewport.right, 
        this.viewport.top, 
        this.viewport.bottom, 
        this.viewport.near, 
        this.viewport.far 
      );

      this.camera.zoom = 35;
      this.camera.updateProjectionMatrix();
      
      this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

      this.camera.position.set(-1, 1, 1);
      this.camera.lookAt(scene.position);
      this.setupPostprocessing();
    }
    else {
      return Renderer.instance;
    }
  }

  setupPostprocessing(){
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const hueSatEffect = new HueSaturationEffect({saturation: -0.0});
    const contBrightEffect = new BrightnessContrastEffect({contrast: -0.2, brightness: 0.25});
    const smaaEffect = new SMAAEffect();

    this.composer.addPass(new EffectPass(this.camera, smaaEffect, hueSatEffect, contBrightEffect));
  }

  update(deltaTime){
    if (this.resizeToDisplaySize()) {
      const vp = calcViewport(this.canvas.width, this.canvas.height);

      this.camera.left = vp.left;
      this.camera.right = vp.right;
      this.camera.top = vp.top;
      this.camera.bottom = vp.bottom;
      this.camera.updateProjectionMatrix();
    }
    if(this.composer) {
      this.composer.render(deltaTime);
    }
    else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  resizeToDisplaySize() {
    const width  = this.canvas.clientWidth | 0;
    const height = this.canvas.clientHeight | 0;
    const needResize = this.canvas.width !== width || this.canvas.height !== height;
    if (needResize) {
      this.renderer.setSize(width, height, false);
      this.composer.setSize(width, height, false);
    }
    return needResize;
  }

  getCamera(){
    return this.camera;
  }
}

export {Renderer};