import * as THREE from "three";
import { VRButton } from "./VRButton.js";
import { XRControllerModelFactory } from "./jsm/webxr/XRControllerModelFactory.js";
import { Hud } from "./hud.js";
import { InputManager } from "./inputManager.js";
import { Actor } from "./actor.js";
import { Player } from "./player.js";
import { Map } from "./map.js";
import * as CANNON from "cannon";

import "./styles.css";
import "./scene.js";

let camera, scene, renderer;
let controller1, controller2;
let controllerGrip1, controllerGrip2;
let user = new THREE.Group();

let count = 0;
const radius = 0.08;
let normal = new THREE.Vector3();
const relativeVelocity = new THREE.Vector3();
let texts = [];
const clock = new THREE.Clock();
let hud;
let actors = [];
let player;
let map;
function appendDebug(text) {
  var node = document.createTextNode(text); // Create a text node
  document.getElementById("debugText").appendChild(node);
}

init();
animate();
let inputManager;

var world, mass, body, shape;

function initCannon() {
  world = new CANNON.World();
  world.gravity.set(0, -3.8, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 10;

  // add a floor
  var groundShape = new CANNON.Plane();
  var groundBody = new CANNON.Body({ mass: 0 });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(1, 0, 0),
    -Math.PI / 2
  );
  world.addBody(groundBody);

  // Materials
  var playerMaterial = new CANNON.Material("playerMaterial");

  // Adjust constraint equation parameters for ground/ground contact
  var playerMaterial_cm = new CANNON.ContactMaterial(
    playerMaterial,
    playerMaterial,
    {
      friction: 0,
      restitution: 0.3,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3
    }
  );
  world.addContactMaterial(playerMaterial_cm);

  //world.add(groundBody);
}

function init() {
  initCannon();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeeeeee);
  scene.fog = new THREE.Fog(0x000000, 0, 1000);
  let light2 = new THREE.SpotLight(0xffffff);
  light2.position.set(10, 30, 20);
  light2.target.position.set(0, 0, 0);
  if (true) {
    light2.castShadow = true;

    light2.shadowCameraNear = 20;
    light2.shadowCameraFar = 50; //camera.far;
    light2.shadowCameraFov = 40;

    light2.shadowMapBias = 0.1;
    light2.shadowMapDarkness = 0.7;
    light2.shadowMapWidth = 2 * 512;
    light2.shadowMapHeight = 2 * 512;

    map = new Map(scene, world);
    //light.shadowCameraVisible = true;
  }
  scene.add(light2);
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );

  let floorGeometry = new THREE.PlaneGeometry(300, 300, 50, 50);
  floorGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

  let material = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });

  let mesh = new THREE.Mesh(floorGeometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  camera.position.set(0, 1.6, 3);
  user.add(camera);
  player = new Player(THREE, CANNON, camera, user, map);
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

  scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

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

  //

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.xr.enabled = true;
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(scene.fog.color, 1);

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
    CANNON,
    renderer.xr,
    user,
    scene,
    user,
    player,
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
let timePassedSinceLastBall = 0;

let controller1LastPosition = new THREE.Vector3(0, 0, 0);
let controller2LastPosition = new THREE.Vector3(0, 0, 0);

function render() {
  const dt = clock.getDelta();

  handleController(controller1);
  handleController(controller2);

  if (hud) {
    hud.render();
  }
  if (inputManager) {
    inputManager.update(hud);
  }
  map.update(dt);
  player.update(dt);

  /* Track controller position with actor */
  const controller1 = inputManager.controller1;
  let three_position = new THREE.Vector3();

  controller1.getWorldPosition(three_position);

  let position = new CANNON.Vec3(
    three_position.x,
    three_position.y,
    three_position.z
  );
  timePassedSinceLastBall += dt;
  const k = 0.1;
  if (controller1 && controller1.getVelocity) {
    appendDebug(JSON.stringify(controller1));
  }
  if (timePassedSinceLastBall > 0.2) {
    if (
      controller1 &&
      controller1.getVelocity &&
      (controller1.getVelocity.x > k ||
        controller1.getVelocity.y > k ||
        controller1.getVelocity.z > k) &&
      !three_position.equals(controller1LastPosition)
    ) {
      timePassedSinceLastBall = 0;
      actors.push(
        new Actor(THREE, CANNON, map, 10, position, controller1.getVelocity)
      );
      controller1LastPosition = three_position;
    }
    const controller2 = inputManager.controller2;
    controller2.getWorldPosition(three_position);
    position = new CANNON.Vec3(
      three_position.x,
      three_position.y,
      three_position.z
    );
    if (
      controller2 &&
      controller1.getVelocity &&
      (controller2.getVelocity.x > k ||
        controller2.getVelocity.y > k ||
        controller2.getVelocity.z > k) &&
      !three_position.equals(controller2LastPosition)
    ) {
      timePassedSinceLastBall = 0;
      actors.push(
        new Actor(THREE, CANNON, map, 10, position, controller2.getVelocity)
      );
      controller2LastPosition = three_position;
    }
  }

  renderer.render(scene, camera);
}

export default function Vr() {
  return (
    <div className="Vr">
      <h1>Matts Test VR APP</h1>
      <p id="debugText"></p>
    </div>
  );
}
