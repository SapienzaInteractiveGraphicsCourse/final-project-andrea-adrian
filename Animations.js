import * as TWEEN from "./resources/libs/tween/build/tween.esm.js";
import { Quaternion } from "./resources/libs/three/build/three.module.js";

const BONE_NAMES = {'spine_001': 'spine1', 
'spine': 'spine', 
'thigh_R': 'thighR', 
'thigh_L': 'thighL',
'shin_R': 'shinR', 
'shin_L': 'shinL',
'foot_R': 'footR', 
'foot_L': 'footL', 
'forearm_R': 'forearmR',
'forearm_L': 'forearmL', 
'upper_arm_R': 'upperarmR', 
'upper_arm_L': 'upperarmL'
};

class Animations {
  constructor() {
    this.animations = {};
    this.bones = null;
    this.nameBones = BONE_NAMES;

    this.animPlaying = {};

    this.init();
  }

  init() {
    const updateBonesRotations = (interpolatedValues) => {
      for(let [key, boneName] of Object.entries(this.nameBones)) {
        const interpolatedQuaternion = new Quaternion(interpolatedValues[boneName+'X'], interpolatedValues[boneName+'Y'], interpolatedValues[boneName+'Z'], interpolatedValues[boneName+'W']);

        this.bones.getObjectByName(key).quaternion.copy(interpolatedQuaternion);
      }
    };

    const updateBonesPositions = (interpolatedValues) => {
      this.bones.getObjectByName('spine').position.set(
        interpolatedValues['spineX'],
        interpolatedValues['spineZ'],
        interpolatedValues['spineY']
        );
    };

    // idle animation
    let startIdleRotations = new TWEEN.Tween(KFRAMES.default.rotations).to(KFRAMES.idle.rotations, 800).onUpdate(updateBonesRotations.bind(this)).yoyo(true).repeat(Infinity);

    this.animations.idleRotations = startIdleRotations;

    let startIdlePositions = new TWEEN.Tween(KFRAMES.default.positions).to(KFRAMES.idle.positions, 800).onUpdate(updateBonesPositions.bind(this)).yoyo(true).repeat(Infinity);

    this.animations.idlePositions = startIdlePositions;

    // shoot animation
    let startShootRotations = new TWEEN.Tween(KFRAMES.default.rotations).to(KFRAMES.shoot.rotations, 300).onUpdate(updateBonesRotations.bind(this)).yoyo(true).repeat(1);

    this.animations.shootRotations = startShootRotations;

    // walk animation
    let startWalkRotations = new TWEEN.Tween(KFRAMES.default.rotations).to(KFRAMES.walk1.rotations, 300).onUpdate(updateBonesRotations.bind(this)).yoyo(true).repeat(Infinity);

    this.animations.walkRotations = startWalkRotations;

    // left
    let startWalkLeftRotations = new TWEEN.Tween(KFRAMES.default.rotations).to(KFRAMES.walkLeft.rotations, 300).onUpdate(updateBonesRotations.bind(this)).yoyo(true).repeat(Infinity);

    this.animations.walkLeftRotations = startWalkLeftRotations;

    // right
    let startWalkRightRotations = new TWEEN.Tween(KFRAMES.default.rotations).to(KFRAMES.walkRight.rotations, 300).onUpdate(updateBonesRotations.bind(this)).yoyo(true).repeat(Infinity);

    this.animations.walkRightRotations = startWalkRightRotations;
  }

  setBones(bones) {
    this.bones = bones;
    console.log('setting bones', bones);
  }

  startAnimation(name) {
    if (name !== 'shoot' && this.animPlaying[name]) return;

    console.log('starting animation', name);

    const rotationAnim = this.animations[name + "Rotations"];

    if(rotationAnim)
      rotationAnim.start();

    const positionAnim = this.animations[name + "Positions"];

    if(positionAnim)
      positionAnim.start();

    this.animPlaying[name] = true;

    console.log(this.animPlaying);
  }

  stopAnimation(name) {
    if (!this.animPlaying[name]) return;

    console.log('stopping animation', name);

    this.animations[name + "Rotations"].stop();

    const positionAnim = this.animations[name + "Positions"];
    if(positionAnim)
      positionAnim.stop();

    this.animPlaying[name] = false;
  }

  update(deltaTime) {
    TWEEN.update();
  }
}

const KFRAMES = {
  default: {
    rotations: {
      spine1X:    -0.192,
      spine1Y:  0,
      spine1Z:  0,
      spine1W:  -0.981,
      
      thighRX:   -0.976,
      thighRY:   0.110,
      thighRZ:   0.028,
      thighRW:   -0.187,
      
      thighLX:   -0.976,
      thighLY:   -0.110,
      thighLZ:   -0.028,
      thighLW:   -0.187,
      
      shinRX:    -0.39200355673222553,
      shinRY:    -0.011487815246784171,
      shinRZ:     0.0961978695234762,
      shinRW:    -0.9150645941731571,
      
      shinLX:    -0.39200355673222553,
      shinLY:    0.011487815246784171,
      shinLZ:    -0.0961978695234762,
      shinLW:    -0.9150645941731571,
      
      footRX:    -0.7492350940168175,
      footRY:    0,
      footRZ:    0,
      footRW:    0.6620511867624819,
      
      footLX:    -0.7492350940168175,
      footLY:    0,
      footLZ:    0,
      footLW:    0.6620511867624819,
      
      spineX:    -0.707,
      spineY:    0,
      spineZ:    0,
      spineW:    -0.707,
      
      forearmRX:  0.51,
      forearmRY:  0.194,
      forearmRZ:  -0.198,
      forearmRW:  0.814,
      
      forearmLX:  -0.5054994273685709,
      forearmLY:  0.2143951362357695,
      forearmLZ:  -0.08116016055489547,
      forearmLW:  -0.831920034634214,
      
      upperarmRX: 0.208,
      upperarmRY: 0.000778,
      upperarmRZ: 0.52,
      upperarmRW: 0.829,
      
      upperarmLX: 0.34524042401880967,
      upperarmLY: 0.7636674982064889,
      upperarmLZ: -0.5071417699690769,
      upperarmLW: 0.2046890250086375,
    },

    positions: {
      spineX: 0,
      spineY: -0.12115,
      spineZ: 0.031233,
    }
  },

  idle: {
    rotations: {
      spine1X:    -0.192,
      spine1Y:  0,
      spine1Z:  0,
      spine1W:  -0.981,
      
      thighRX:   -0.9858159140979746,
      thighRY:   0.11154107467393065,
      thighRZ:   0.021037791247767133,
      thighRW:   -0.12534745115547694,
      
      thighLX:   -0.9858159140979746,
      thighLY:   -0.11154107467393065,
      thighLZ:   -0.021037791247767133,
      thighLW:   -0.12534745115547694,
      
      shinRX:    -0.2742244870936753,
      shinRY:    -0.023454020441693493,
      shinRZ:    0.09399951555790392,
      shinRW:    -0.9569801098655137,
      
      shinLX:    -0.2742244870936753,
      shinLY:    0.023454020441693493,
      shinLZ:    -0.09399951555790392,
      shinLW:    -0.9569801098655137,
      
      footRX:    -0.6603501354927926,
      footRY:    0,
      footRZ:    0,
      footRW:    0.7507347724427386,
      
      footLX:    -0.6603501354927926,
      footLY:    0,
      footLZ:    0,
      footLW:    0.7507347724427386,
      
      spineX:    -0.707,
      spineY:    0,
      spineZ:    0,
      spineW:    -0.707,
      
      forearmRX:  0.51,
      forearmRY:  0.194,
      forearmRZ:  -0.198,
      forearmRW:  0.814,
      
      forearmLX:  -0.5054994273685709,
      forearmLY:  0.2143951362357695,
      forearmLZ:  -0.08116016055489547,
      forearmLW:  -0.831920034634214,
      
      upperarmRX: 0.208,
      upperarmRY: 0.000778,
      upperarmRZ: 0.52,
      upperarmRW: 0.829,
      
      upperarmLX: 0.34524042401880967,
      upperarmLY: 0.7636674982064889,
      upperarmLZ: -0.5071417699690769,
      upperarmLW: 0.2046890250086375,
    },

    positions: {
      spineX: 0,
      spineY: -0.02,
      spineZ: 0.015143,
    }
  },

  shoot: {
    rotations: {
      spine1X:    -0.192,
      spine1Y:  0,
      spine1Z:  0,
      spine1W:  -0.981,
      
      thighRX:   -0.976,
      thighRY:   0.110,
      thighRZ:   0.028,
      thighRW:   -0.187,
      
      thighLX:   -0.976,
      thighLY:   -0.110,
      thighLZ:   -0.028,
      thighLW:   -0.187,
      
      shinRX:    -0.39200355673222553,
      shinRY:    -0.011487815246784171,
      shinRZ:     0.0961978695234762,
      shinRW:    -0.9150645941731571,
      
      shinLX:    -0.39200355673222553,
      shinLY:    0.011487815246784171,
      shinLZ:    -0.0961978695234762,
      shinLW:    -0.9150645941731571,
      
      footRX:    -0.7492350940168175,
      footRY:    0,
      footRZ:    0,
      footRW:    0.6620511867624819,
      
      footLX:    -0.7492350940168175,
      footLY:    0,
      footLZ:    0,
      footLW:    0.6620511867624819,
      
      spineX:    -0.707,
      spineY:    0,
      spineZ:    0,
      spineW:    -0.707,
      
      forearmRX:  0.51,
      forearmRY:  0.194,
      forearmRZ:  -0.198,
      forearmRW:  0.814,
      
      forearmLX:  -0.5054994273685709,
      forearmLY:  0.2143951362357695,
      forearmLZ:  -0.08116016055489547,
      forearmLW:  -0.831920034634214,
      
      upperarmRX: -0.4420220580326779,
      upperarmRY: 0.45020863846351056,
      upperarmRZ: -0.6649203600214463,
      upperarmRW: -0.4008930058985045,
      
      upperarmLX: 0.34524042401880967,
      upperarmLY: 0.7636674982064889,
      upperarmLZ: -0.5071417699690769,
      upperarmLW: 0.2046890250086375,
    },

    //{_x: -0.9236720508836697, _y: -0.10280492077175546, _z: -0.04811598762483299, _w: -0.366571878921932}

    positions: {
      spineX: 0,
      spineY: -0.12115,
      spineZ: 0.031233,
    }
  },

  walk1: {
    rotations: {
      spine1X:    -0.192,
      spine1Y:  0,
      spine1Z:  0,
      spine1W:  -0.981,
      
      thighRX:   -0.9937526625387306,
      thighRY:   0.11329827438855605,
      thighRZ:   0.006892098415973578,
      thighRW:   -0.0008035528505975498,
      
      thighLX:   -0.9236720508836697,
      thighLY:   -0.10280492077175546,
      thighLZ:   -0.04811598762483299,
      thighLW:   -0.366571878921932,
      
      shinRX:    -0.39200355673222553,
      shinRY:    -0.011487815246784171,
      shinRZ:     0.0961978695234762,
      shinRW:    -0.9150645941731571,
      
      shinLX:    -0.39200355673222553,
      shinLY:    0.011487815246784171,
      shinLZ:    -0.0961978695234762,
      shinLW:    -0.9150645941731571,
      
      footRX:    -0.7492350940168175,
      footRY:    0,
      footRZ:    0,
      footRW:    0.6620511867624819,
      
      footLX:    -0.5610510608579964,
      footLY:    0,
      footLZ:    0,
      footLW:    0.8275788222943581,
      
      spineX:    -0.707,
      spineY:    0,
      spineZ:    0,
      spineW:    -0.707,
      
      forearmRX:  0.51,
      forearmRY:  0.194,
      forearmRZ:  -0.198,
      forearmRW:  0.814,
      
      forearmLX:  -0.5054994273685709,
      forearmLY:  0.2143951362357695,
      forearmLZ:  -0.08116016055489547,
      forearmLW:  -0.831920034634214,
      
      upperarmRX: 0.208,
      upperarmRY: 0.000778,
      upperarmRZ: 0.52,
      upperarmRW: 0.829,
      
      upperarmLX: 0.34524042401880967,
      upperarmLY: 0.7636674982064889,
      upperarmLZ: -0.5071417699690769,
      upperarmLW: 0.2046890250086375,
    },
    //{_x: -0.9937526625387306, _y: 0.11329827438855605, _z: 0.006892098415973578, _w: -0.0008035528505975498}

    positions: {
      spineX: 0,
      spineY: -0.12115,
      spineZ: 0.031233,
    }
  },

  walkLeft: {
    rotations: {
      spine1X:    -0.192,
      spine1Y:  0,
      spine1Z:  0,
      spine1W:  -0.981,
      
      thighRX:   -0.9545172927908568,
      thighRY:   0.2314578531033535,
      thighRZ:   0.004341896960280485,
      thighRW:   -0.1890347796856079,
      
      thighLX:   -0.9671671297977686,
      thighLY:   -0.17106648718771972,
      thighLZ:   -0.016202921244010002,
      thighLW:   -0.18838913276290756,
      
      shinRX:    -0.39200355673222553,
      shinRY:    -0.011487815246784171,
      shinRZ:     0.0961978695234762,
      shinRW:    -0.9150645941731571,
      
      shinLX:    -0.39200355673222553,
      shinLY:    0.011487815246784171,
      shinLZ:    -0.0961978695234762,
      shinLW:    -0.9150645941731571,
      
      footRX:    -0.7492350940168175,
      footRY:    0,
      footRZ:    0,
      footRW:    0.6620511867624819,
      
      footLX:    -0.7492350940168175,
      footLY:    0,
      footLZ:    0,
      footLW:    0.6620511867624819,
      
      spineX:    -0.707,
      spineY:    0,
      spineZ:    0,
      spineW:    -0.707,
      
      forearmRX:  0.51,
      forearmRY:  0.194,
      forearmRZ:  -0.198,
      forearmRW:  0.814,
      
      forearmLX:  -0.5054994273685709,
      forearmLY:  0.2143951362357695,
      forearmLZ:  -0.08116016055489547,
      forearmLW:  -0.831920034634214,
      
      upperarmRX: 0.208,
      upperarmRY: 0.000778,
      upperarmRZ: 0.52,
      upperarmRW: 0.829,
      
      upperarmLX: 0.34524042401880967,
      upperarmLY: 0.7636674982064889,
      upperarmLZ: -0.5071417699690769,
      upperarmLW: 0.2046890250086375,
    },

    //  _x: -0.9671671297977686, _y: -0.17106648718771972, _z: -0.016202921244010002, _w: -0.18838913276290756}

    positions: {
      spineX: 0,
      spineY: -0.12115,
      spineZ: 0.031233,
    }
  },

  walkRight: {
    rotations: {
      spine1X:    -0.192,
      spine1Y:  0,
      spine1Z:  0,
      spine1W:  -0.981,
      
      thighRX:   -0.9671671297977686,
      thighRY:   0.17106648718771972,
      thighRZ:   0.016202921244010002,
      thighRW:   -0.18838913276290756,
      
      thighLX:   -0.9545172927908568,
      thighLY:   -0.2314578531033535,
      thighLZ:   -0.004341896960280485,
      thighLW:   -0.1890347796856079,
      
      shinRX:    -0.39200355673222553,
      shinRY:    -0.011487815246784171,
      shinRZ:     0.0961978695234762,
      shinRW:    -0.9150645941731571,
      
      shinLX:    -0.39200355673222553,
      shinLY:    0.011487815246784171,
      shinLZ:    -0.0961978695234762,
      shinLW:    -0.9150645941731571,
      
      footRX:    -0.7492350940168175,
      footRY:    0,
      footRZ:    0,
      footRW:    0.6620511867624819,
      
      footLX:    -0.7492350940168175,
      footLY:    0,
      footLZ:    0,
      footLW:    0.6620511867624819,
      
      spineX:    -0.707,
      spineY:    0,
      spineZ:    0,
      spineW:    -0.707,
      
      forearmRX:  0.51,
      forearmRY:  0.194,
      forearmRZ:  -0.198,
      forearmRW:  0.814,
      
      forearmLX:  -0.5054994273685709,
      forearmLY:  0.2143951362357695,
      forearmLZ:  -0.08116016055489547,
      forearmLW:  -0.831920034634214,
      
      upperarmRX: 0.208,
      upperarmRY: 0.000778,
      upperarmRZ: 0.52,
      upperarmRW: 0.829,
      
      upperarmLX: 0.34524042401880967,
      upperarmLY: 0.7636674982064889,
      upperarmLZ: -0.5071417699690769,
      upperarmLW: 0.2046890250086375,
    },

    //{{_x: -0.9671671297977686, _y: 0.17106648718771972, _z: 0.016202921244010002, _w: -0.18838913276290756}

    positions: {
      spineX: 0,
      spineY: -0.12115,
      spineZ: 0.031233,
    }
  },
}

export { KFRAMES, Animations, BONE_NAMES };