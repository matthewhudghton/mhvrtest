import * as THREE from "three";
import { VRButton } from "./VRButton.js";
import { XRControllerModelFactory } from "./jsm/webxr/XRControllerModelFactory.js";
import { Hud } from "./hud.js";
import { InputManager } from "./inputManager.js";
import { Actor } from "./actor.js";

import "./styles.css";
import "./scene.js";

let camera, scene, renderer;
let controller1, controller2;
let controllerGrip1, controllerGrip2;
let user = new THREE.Group();
let room;

let count = 0;
const radius = 0.08;
let normal = new THREE.Vector3();
const relativeVelocity = new THREE.Vector3();
let texts = [];
const clock = new THREE.Clock();
let hud;
let actors = [];
init();
animate();
let inputManager;

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x505050);

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    10
  );
  camera.position.set(0, 1.6, 3);
  user.add(camera);
  scene.add(user);
  const roomGeometry = new THREE.BufferGeometry();
  // create a simple square shape. We duplicate the top left and bottom right
  // vertices because each vertex needs to appear once per triangle.
  const vertices = new Float32Array([
    -10.0,
    -10.0,
    10.0,
    10.0,
    -10.0,
    10.0,
    10.0,
    10.0,
    10.0,

    10.0,
    10.0,
    10.0,
    -10.0,
    10.0,
    10.0,
    -10.0,
    -10.0,
    10.0
  ]);

  // itemSize = 3 because there are 3 values (components) per vertex
  roomGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  room = new THREE.LineSegments(
    roomGeometry,
    new THREE.LineBasicMaterial({ color: 0x808080 })
  );
  room.geometry.translate(0, 3, 0);
  scene.add(room);

  scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  const geometry = new THREE.IcosahedronGeometry(radius, 3);

  var loader = new THREE.FontLoader();
  loader.load("./fonts/helvetiker.typeface.json", function (font) {
    var textGeometry = new THREE.TextGeometry("text", {
      font: font,
      size: 0.1,
      height: 0.1
    });
    hud = new Hud(camera, scene, font);
    hud.debugText = "Hello my debug text!";
    var textMaterial = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      specular: 0xffffff
    });
  });

  for (let i = 0; i < 10; i++) {
    actors.push(new Actor(THREE, room, Math.random() * 1000));
  }

  //

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);
  let hudElement = document.createElement("div");
  hudElement.className = "hud";
  hudElement.textContent = "Example text";
  hudElement.style.position = "absolute";
  hudElement.style.zIndex = 100; // if you still don't see the label, try uncommenting this
  hudElement.style.width = 100;
  hudElement.style.height = 100;
  hudElement.style.backgroundColor = "blue";
  hudElement.innerHTML = "hi there!";
  hudElement.style.top = 200 + "px";
  hudElement.style.left = 200 + "px";

  document.body.appendChild(hudElement);
  //

  document.body.appendChild(VRButton.createButton(renderer));

  // controllers

  function onSelectStart() {
    this.userData.isSelecting = true;
  }

  function onSelectEnd() {
    this.userData.isSelecting = false;
  }

  controller1 = renderer.xr.getController(0);
  controller1.addEventListener("selectstart", onSelectStart);
  controller1.addEventListener("selectend", onSelectEnd);

  controller1.addEventListener("connected", function (event) {
    this.add(buildController(event.data));
    controller1.gamepad = event.data.gamepad;
  });
  controller1.addEventListener("disconnected", function () {
    this.remove(this.children[0]);
  });
  user.add(controller1);

  controller2 = renderer.xr.getController(1);
  controller2.addEventListener("selectstart", onSelectStart);
  controller2.addEventListener("selectend", onSelectEnd);
  controller2.addEventListener("connected", function (event) {
    this.add(buildController(event.data));
    controller2.gamepad = event.data.gamepad;
  });
  controller2.addEventListener("disconnected", function () {
    this.remove(this.children[0]);
  });
  user.add(controller2);

  // The XRControllerModelFactory will automatically fetch controller models
  // that match what the user is holding as closely as possible. The models
  // should be attached to the object returned from getControllerGrip in
  // order to match the orientation of the held device.

  const controllerModelFactory = new XRControllerModelFactory();

  controllerGrip1 = renderer.xr.getControllerGrip(0);
  controllerGrip1.add(
    controllerModelFactory.createControllerModel(controllerGrip1)
  );
  user.add(controllerGrip1);

  controllerGrip2 = renderer.xr.getControllerGrip(1);
  controllerGrip2.add(
    controllerModelFactory.createControllerModel(controllerGrip2)
  );
  user.add(controllerGrip2);

  //
  inputManager = new InputManager(
    THREE,
    renderer.xr,
    camera,
    scene,
    user,
    controller1,
    controller2
  );
  window.addEventListener("resize", onWindowResize);
}

function buildController(data) {
  let geometry, material;

  switch (data.targetRayMode) {
    case "tracked-pointer":
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3)
      );
      geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3)
      );

      material = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending
      });

      return new THREE.Line(geometry, material);

    case "gaze":
      geometry = new THREE.RingGeometry(0.02, 0.04, 32).translate(0, 0, -1);
      material = new THREE.MeshBasicMaterial({
        opacity: 0.5,
        transparent: true
      });
      return new THREE.Mesh(geometry, material);
    default:
      console.err("Running default case " + data);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleController(controller) {}

//

function animate() {
  renderer.setAnimationLoop(render);
}

let controller1LastPosition = new THREE.Vector3(0, 0, 0);
let controller2LastPosition = new THREE.Vector3(0, 0, 0);

function render() {
  const delta = clock.getDelta() * 0.8;
  handleController(controller1);
  handleController(controller2);

  if (hud) {
    hud.render();
  }
  if (inputManager) {
    inputManager.update(hud);
  }

  /* Delete any actor marked as should remove */
  let i = actors.length;
  while (i--) {
    const actor = actors[i];
    actor.update(delta);
    if (actor.shouldBeDeleted) {
      actor.delete();
      actors.splice(i, 1);
    }
  }

  /* Track controller position with actor */
  const controller1 = inputManager.controller1;
  let position = new THREE.Vector3();
  controller1.getWorldPosition(position);
  // if (controller1 && !controller1.position.equals(controller1LastPosition)) {
  actors.push(new Actor(THREE, room, 100, position));
  controller1LastPosition = controller1.position;
  //}
  const controller2 = inputManager.controller2;
  controller2.getWorldPosition(position);
  // if (controller2 && !controller2.position.equals(controller2LastPosition)) {
  actors.push(new Actor(THREE, room, 100, position));
  controller2LastPosition = controller2.position;
  // }

  const range = 3 - radius;

  for (let i = 0; i < room.children.length; i++) {
    const object = room.children[i];

    // keep objects inside room

    if (object.position.x < -range || object.position.x > range) {
      object.position.x = THREE.MathUtils.clamp(
        object.position.x,
        -range,
        range
      );
      object.userData.velocity.x = -object.userData.velocity.x;
    }

    if (object.position.y < radius || object.position.y > 6) {
      object.position.y = Math.max(object.position.y, radius);

      object.userData.velocity.x *= 0.98;
      object.userData.velocity.y = -object.userData.velocity.y;
      object.userData.velocity.z *= 0.98;
    }

    if (object.position.z < -range || object.position.z > range) {
      object.position.z = THREE.MathUtils.clamp(
        object.position.z,
        -range,
        range
      );
      object.userData.velocity.z = -object.userData.velocity.z;
    }

    for (let j = i + 1; j < room.children.length; j++) {
      const object2 = room.children[j];

      normal.copy(object.position).sub(object2.position);

      const distance = normal.length();

      if (distance < 2 * radius) {
        normal.multiplyScalar(0.5 * distance - radius);

        object.position.sub(normal);
        object2.position.add(normal);

        normal.normalize();

        relativeVelocity
          .copy(object.userData.velocity)
          .sub(object2.userData.velocity);

        normal = normal.multiplyScalar(relativeVelocity.dot(normal));

        object.userData.velocity.sub(normal);
        object2.userData.velocity.add(normal);
      }
    }

    object.userData.velocity.y -= 9.8 * delta;
  }

  renderer.render(scene, camera);
}

export default function Vr() {
  return (
    <div className="Vr">
      <h1>Matts Test VR APP</h1>
    </div>
  );
}
