import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Pinput } from "./pinput.js";
import { ShapeRecogniser } from "./shapeRecogniser.js";
import { Debouncer } from "./debouncer.js";
import { ControllerHandler, controllerHandler } from "./controllerHandler.js";

let lastPosition;
export class InputManager {
  constructor(xr, camera, scene, user, player, controller1, controller2) {
    this.input = new Pinput();
    this.camera = camera;
    this.scene = scene;
    this.xr = xr;
    this.player = player;
    this.user = user;
    this.controller1 = controller1;
    this.controller2 = controller2;
    this.rightShapeRecogniser = new ShapeRecogniser();
    this.leftShapeRecogniser = new ShapeRecogniser();
    this.shapeDebouncer = new Debouncer(1);
    this.leftPointsDebouncer = new Debouncer(0.01);
    this.rightPointsDebouncer = new Debouncer(0.01);
    this.leftDeflectDebouncer = new Debouncer(1);
    this.rightDeflectDebouncer = new Debouncer(1);
    this.leftWasSelecting = false;
    this.rightWasSelecting = false;
    this.controllerHandler1 = new ControllerHandler({
      controller: this.controller1,
      controllerGrip: this.player.leftControllerGrip,
      player: this.player,
      camera: this.camera,
      index: 0
    });
    this.controllerHandler2 = new ControllerHandler({
      controller: this.controller2,
      controllerGrip: this.player.rightControllerGrip,
      player: this.player,
      camera: this.camera,
      index: 1
    });
  }
  update(dt, hud) {
    this.hud = hud; // debug remove this later
    this.input.update();
    this.shapeDebouncer.update(dt);
    this.rightPointsDebouncer.update(dt);
    this.leftDeflectDebouncer.update(dt);
    this.rightDeflectDebouncer.update(dt);

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
      this.player.bodyActor.body.position.z -= value * 30;
      this.player.addMessage({ forward: 2 });
    }
    if (this.input.isDown("s")) {
      this.player.bodyActor.body.position.z += value * 30;
      this.player.addMessage({ backward: 2 });
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
          position: new THREE.Vector3(1, 1, 1),
          shapeMatches: [{ name: "circle", size: 0.5 }]
        }
      });
    }

    if (this.input.isDown("o")) {
      this.player.addMessage({
        magic: {
          position: new THREE.Vector3(1, 4, 1),
          shapeMatches: [{ name: "circle", size: 2 }]
        }
      });
    }

    if (this.input.isDown("i")) {
      this.player.addMessage({
        magic: {
          position: new THREE.Vector3(1, 1, 1),
          shapeMatches: [{ name: "square", size: 2, width: 2, height: 2 }]
        }
      });
    }

    var first = true;
    /* Quest controller*/

    let controllerState = this.getQuest2ControllerData();

    if (controllerState) {
      if (controllerState[0].axes[2] > 0) {
        this.player.addMessage({
          useLeftController: true,
          forward: controllerState[0].axes[2]
        });
      }
      if (controllerState[0].axes[2] < 0) {
        this.player.addMessage({
          useLeftController: true,
          backward: controllerState[0].axes[2]
        });
      }

      if (controllerState[1].axes[2] < 0) {
        this.player.addMessage({
          useLeftController: false,
          forward: controllerState[1].axes[2]
        });
      }
      if (controllerState[1].axes[2] > 0) {
        this.player.addMessage({
          useLeftController: false,
          backward: controllerState[1].axes[2]
        });
        /*
Debug text for constroller state
        var node = document.createTextNode(
          " " + JSON.stringify(controllerState[1]) + " "
        );
        document.getElementById("debugText").appendChild(node);
        */
      }

      this.player.leftSelecting = this?.controller1?.userData?.isSelecting;
      this.player.rightSelecting = this?.controller2?.userData?.isSelecting;

      this.controllerHandler1.update(dt, controllerState[0]);
      this.controllerHandler2.update(dt, controllerState[1]);
    } // end of controller state
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
