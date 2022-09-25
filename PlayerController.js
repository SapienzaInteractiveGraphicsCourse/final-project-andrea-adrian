class PlayerController {
  inputKeys =
  {
    moveHorizPos: false,
    moveHorizNeg: false,
    moveVertPos: false,
    moveVertNeg: false,
    fire: false
  };

  SPEED = 5;

  constructor() {
  }

  getPlayerVelocity(){
    return {
      x: (this.inputKeys.moveVertNeg - this.inputKeys.moveVertPos) * this.SPEED, z: (this.inputKeys.moveHorizPos - this.inputKeys.moveHorizNeg) * this.SPEED
    }
  }

  isShooting() {
    return this.inputKeys.fire;
  }

  handleInput(inputEvent) {
    if (inputEvent.type === "keydown") {
      switch(inputEvent.code){
        case "KeyW":
          this.inputKeys.moveVertPos = true;
          break;
        case "KeyS":
          this.inputKeys.moveVertNeg = true;
          break;
        case "KeyD":
          this.inputKeys.moveHorizPos = true;
          break;
        case "KeyA":
          this.inputKeys.moveHorizNeg = true;
          break;
        case "Space":
          this.inputKeys.fire = true;
          break;
      }
    }
    else if (inputEvent.type === "keyup") {
      switch(inputEvent.code){
        case "KeyW":
          this.inputKeys.moveVertPos = false;
          break;
        case "KeyS":
          this.inputKeys.moveVertNeg = false;
          break;
        case "KeyD":
          this.inputKeys.moveHorizPos = false;
          break;
        case "KeyA":
          this.inputKeys.moveHorizNeg = false;
          break;
        case "Space":
          this.inputKeys.fire = false;
          break;
      }
    }
  }
}

export { PlayerController };