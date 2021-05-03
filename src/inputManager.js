import { Pinput } from "./pinput.js";
import { ShapeRecogniser } from "./shapeRecogniser.js";
import { Debouncer } from "./debouncer.js";

let lastPosition;
export class InputManager {
  constructor(
    THREE,
    CANNON,
    xr,
    camera,
    scene,
    user,
    player,
    controller1,
    controller2
  ) {
    this.input = new Pinput();
    this.CANNON = CANNON;
    this.camera = camera;
    this.scene = scene;
    this.xr = xr;
    this.player = player;
    this.THREE = THREE;
    this.user = user;
    this.controller1 = controller1;
    this.controller2 = controller2;
    this.shapeRecogniser = new ShapeRecogniser();
    this.shapeDebouncer = new Debouncer(1);
    this.pointsDebouncer = new Debouncer(0.01);
    this.leftWasSelecting = false;
    this.rightWasSelecting = false;
  }
  update(dt, hud) {
    this.hud = hud; // debug remove this later
    this.input.update();
    this.shapeDebouncer.update(dt);
    this.pointsDebouncer.update(dt);

    /// handle camera
    const value = 0.1;
    if (this.input.isDown("a")) {
      this.camera.position.x -= value;
    }
    if (this.input.isDown("d")) {
      this.camera.position.x += value;
    }
    if (this.input.isDown("q")) {
      this.camera.position.y += value;
    }
    if (this.input.isDown("z")) {
      this.camera.position.y -= value;
    }
    if (this.input.isDown("w")) {
      //this.camera.position.z -= value;
      this.player.addMessage({ forward: 10 });
    }
    if (this.input.isDown("s")) {
      //this.camera.position.z += value;
      this.player.addMessage({ backward: 10 });
    }
    if (this.input.isDown("h")) {
      this.camera.rotation.y -= value;
    }
    if (this.input.isDown("f")) {
      this.camera.rotation.y += value;
    }
    if (this.input.isDown("t")) {
      this.camera.rotation.x += value;
    }
    if (this.input.isDown("g")) {
      this.camera.rotation.x -= value;
    }
    if (this.input.isDown("p")) {
      this.player.addMessage({
        magic: {
          position: new this.THREE.Vector3(1, 1, 1),
          shapeMatches: ["circle"]
        }
      });
    }

    var first = true;
    /* Quest controller*/

    let controllerState = this.getQuest2ControllerData();
    if (hud && controllerState) {
      if (!this.value) {
        this.value = 0;
      }
      if (this.value % 600 == 0) {
        //hud.debugText = JSON.stringify(controllerState, null, "  ");
      }
      this.value++;
    }

    if (controllerState) {
      if (controllerState[0].axes[2] < 0) {
        this.player.addMessage({ forward: controllerState[0].axes[2] });
      }
      if (controllerState[0].axes[2] > 0) {
        this.player.addMessage({ backward: controllerState[0].axes[2] });
      }

      this.player.leftSelecting = this?.controller1?.userData?.isSelecting;
      this.player.rightSelecting = this?.controller2?.userData?.isSelecting;

      if (this?.controller2?.userData?.isSelecting) {
        this.player.addMessage({
          fire: { position: this.getController2Position() }
        });

        if (this.shapeDebouncer.tryFireAndReset()) {
          var node = document.createTextNode(" print ");
          document.getElementById("debugText").appendChild(node);
          this.shapeRecogniser.print();
          this.shapeRecogniser = new ShapeRecogniser();
        }
        if (first) {
          //hud.debugText = JSON.stringify(this.getController2Position());
          first = false;
        }
      }

      if (this.rightWasSelecting && !this?.controller1?.userData?.isSelecting) {
        this.rightWasSelecting = false;
        const shapeMatches = this.shapeRecogniser.getShapeInfo();
        if (shapeMatches.length > 0) {
          this.player.addMessage({
            magic: {
              position: this.getController1Position(),
              quaternion: this.controller1.quaternion,
              shapeMatches: shapeMatches
            }
          });
        }
        this.shapeRecogniser.clear();
      }

      if (
        this.pointsDebouncer.tryFireAndReset() &&
        this?.controller1?.userData?.isSelecting
      ) {
        this.rightWasSelecting = true;
        let position = this.controller1.position; //this.getController1Position();
        let positionRelativeToCamera = new this.THREE.Vector3(0, 0, 0);
        positionRelativeToCamera.copy(position);
        this.camera.matrixWorldInverse.getInverse(this.camera.matrixWorld);
        positionRelativeToCamera.applyMatrix4(this.camera.matrixWorldInverse);

        if (lastPosition !== undefined) {
          /*
          var node = document.createTextNode(
            "(" +
              (positionRelativeToCamera.x - lastPosition.x).toFixed(3) +
              ", " +
              (positionRelativeToCamera.y - lastPosition.y).toFixed(3) +
              ", " +
              (positionRelativeToCamera.z - lastPosition.z).toFixed(3) +
              ") "
          );
          var br = document.createElement("br");
          document.getElementById("debugText").appendChild(br);

          document.getElementById("debugText").appendChild(node);
          */
          this.shapeRecogniser.addPoint(
            positionRelativeToCamera.x,
            positionRelativeToCamera.y,
            new Date().getTime()
          );
        }
        lastPosition = new this.THREE.Vector3(
          positionRelativeToCamera.x,
          positionRelativeToCamera.y,
          positionRelativeToCamera.z
        );

        if (first) {
          //hud.debugText = JSON.stringify(this.getController1Position());

          first = false;
        }
      }
    }
  }

  getControllerPosition(controller) {
    const THREE = this.THREE;
    const CANNON = this.CANNON;
    let three_position = new THREE.Vector3();

    controller.getWorldPosition(three_position);

    let position = new CANNON.Vec3(
      three_position.x,
      three_position.y,
      three_position.z
    );
    return position;
  }

  getController1Position() {
    return this.getControllerPosition(this.controller1);
  }
  getController2Position() {
    return this.getControllerPosition(this.controller2);
  }

  getQuest2ControllerData() {
    const session = this.xr.getSession();
    let i = 0;
    let handedness;
    let data = [];
    if (session && session.inputSources) {
      for (const source of session.inputSources) {
        if (source && source.handedness) {
          handedness = source.handedness; //left or right controllers
        }
        if (!source.gamepad) continue;
        data.push({
          handedness: handedness,
          buttons: source.gamepad.buttons.map((b) => b.value),
          axes: source.gamepad.axes.slice(0)
        });
      }
    }
    if (data.length != 2) {
      return undefined;
    }
    return data;
  }
}
