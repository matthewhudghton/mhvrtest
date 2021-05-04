import { Debouncer } from "./debouncer.js";
import { ShapeRecogniser } from "./shapeRecogniser.js";

export class ControllerHandler {
  constructor(options) {
    this.controller = options.controller;
    this.player = options.player;
    this.camera = options.camera;
    this.THREE = options.THREE;
    this.shapeRecogniser = new ShapeRecogniser();
    this.wasSelecting = false;
    this.addPointsDebouncer = new Debouncer(0.01);
  }

  update(dt) {
    this.addPointsDebouncer.update(dt);

    if (this.wasSelecting && !this?.controller?.userData?.isSelecting) {
      this.wasSelecting = false;
      const shapeMatches = this.shapeRecogniser.getShapeInfo();
      if (shapeMatches.length > 0) {
        this.player.addMessage({
          magic: {
            position: this.getControllerPosition(),
            quaternion: this.controller.quaternion,
            shapeMatches: shapeMatches
          }
        });
      }
      //this.shapeRecogniser.clear();
      this.shapeRecogniser = new ShapeRecogniser();
    }
    if (
      this.addPointsDebouncer.tryFireAndReset() &&
      this?.controller?.userData?.isSelecting
    ) {
      this.wasSelecting = true;
      let position = this.controller.position;
      let positionRelativeToCamera = new this.THREE.Vector3(0, 0, 0);
      positionRelativeToCamera.copy(position);
      this.camera.matrixWorldInverse.getInverse(this.camera.matrixWorld);
      positionRelativeToCamera.applyMatrix4(this.camera.matrixWorldInverse);
      this.shapeRecogniser.addPoint(
        positionRelativeToCamera.x,
        positionRelativeToCamera.y,
        new Date().getTime()
      );
    }
  }

  get isSelecting() {
    return this?.controller?.userData?.isSelecting;
  }

  getControllerPosition() {
    const THREE = this.THREE;
    let three_position = new THREE.Vector3();

    return this.controller.getWorldPosition(three_position);
  }
}
