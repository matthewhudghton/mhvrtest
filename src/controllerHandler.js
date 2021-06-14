import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Debouncer } from "./debouncer.js";
import { ShapeRecogniser } from "./shapeRecogniser.js";

export class ControllerHandler {
  constructor(options) {
    this.controller = options.controller;
    this.controllerGrip = options.controllerGrip;
    this.player = options.player;
    this.camera = options.camera;
    this.shapeRecogniser = new ShapeRecogniser();
    this.wasSelecting = false;
    this.addPointsDebouncer = new Debouncer(0.01);
    this.deflectDebounce = new Debouncer(0.3);
    this.debugMesh = [];
    this.isGripButtonPressed = false;
    this.index = options.index;

    this.addPointerToControllerGrip(this.controllerGrip);
  }

  addPointerToControllerGrip(controllerGrip) {
    const lineVertexShader = `
  	varying vec3 vPos;
    void main() 
    {
      vPos = position;
      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * modelViewPosition;
    }
  `;

    const lineFragmentShader = `
    uniform vec3 origin;
    uniform vec3 color;
  	varying vec3 vPos;
    float limitDistance = 7.0;
    void main() {
    	float distance = clamp(length(vPos - origin), 0., limitDistance);
      float opacity = 1. - distance / limitDistance;
      gl_FragColor = vec4(color, opacity);
    }
  `;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: {
          value: new THREE.Color(0x00ff00)
        },
        origin: {
          value: new THREE.Vector3()
        }
      },
      vertexShader: lineVertexShader,
      fragmentShader: lineFragmentShader,
      transparent: true
    });

    const points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3(0, 0, -10.5));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    controllerGrip.add(line);
  }

  update(dt, state) {
    if (state.buttons[5] === 1 && this.deflectDebounce.tryFireAndReset()) {
      this.player.addMessage({
        magic: {
          position: this.getControllerPosition(),
          quaternion: this.controller.quaternion,
          attachedTo: this.controllerGrip,
          shapeMatches: [{ name: "portal", size: 0.1 }]
        }
      });
    }

    const gripButtonIsNowPressed = state.buttons[1] === 1;
    if (gripButtonIsNowPressed && !this.isGripButtonPressed) {
      this.isGripButtonPressed = true;
      this.player.addMessage({
        grab: {
          position: this.getControllerPosition(),
          quaternion: this.controllerGrip.quaternion,
          attachedTo: this.controllerGrip,
          index: this.index
        }
      });
    }
    this.isGripButtonPressed = gripButtonIsNowPressed;

    this.deflectDebounce.update(dt);
    this.addPointsDebouncer.update(dt);
    if (this.wasSelecting && !this?.controller?.userData?.isSelecting) {
      this.wasSelecting = false;
      /*const shapeMatches = this.shapeRecogniser.getShapeInfo();
      if (shapeMatches.length > 0) {
        this.player.addMessage({
          magic: {
            position: this.getControllerPosition(),
            quaternion: this.controller.quaternion,
            attachedTo: this.controllerGrip,
            shapeMatches: shapeMatches
          }
        });
      }*/
      //this.shapeRecogniser.clear();
      this.shapeRecogniser = new ShapeRecogniser();
      this.debugMesh.forEach((mesh) => {
        this.camera.remove(mesh);
        this.player.scene.remove(mesh);
        this.player.cameraGroup.remove(mesh);
      });
      this.debugMesh = [];
    }
    if (
      this.addPointsDebouncer.tryFireAndReset() &&
      this?.controller?.userData?.isSelecting
    ) {
      this.wasSelecting = true;

      let position = new THREE.Vector3(0, 0, 0);
      position.copy(this.getControllerPosition());

      position.applyMatrix4(this.camera.matrixWorldInverse);
      this.shapeRecogniser.addPoint(
        position.x,
        position.y,
        new Date().getTime()
      );

      const shapeMatches = this.shapeRecogniser.getShapeInfo();
      if (shapeMatches.length > 0) {
        this.player.addMessage({
          magic: {
            position: this.getControllerPosition(),
            quaternion: this.controller.quaternion,
            attachedTo: this.controllerGrip,
            shapeMatches: shapeMatches
          }
        });
        this.shapeRecogniser = new ShapeRecogniser();
      }

      /*const mesh = new this.THREE.Mesh(
        new this.THREE.IcosahedronGeometry(0.03, 3),
        new this.THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
      );*/

      //mesh.position.copy(positionRelativeToCamera);

      //mesh.position.copy(position);
      //this.debugMesh.push(mesh);
      //this.camera.add(mesh);
      //this.player.cameraGroup.add(mesh);
    }
  }

  get isSelecting() {
    return this?.controller?.userData?.isSelecting;
  }

  getControllerPosition() {
    let three_position = new THREE.Vector3();

    return this.controller.getWorldPosition(three_position);
  }
}
