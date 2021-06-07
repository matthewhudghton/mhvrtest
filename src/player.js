import { Vector3 } from "three";
import { Actor } from "./actor.js";
import { Debouncer } from "./debouncer.js";
import { Entity } from "./entity.js";
import { Gun } from "./gun.js";
import { ParticleSystem } from "./particleSystem.js";
import { Sound } from "./sound.js";
import * as YUKA from "yuka";
import * as THREE from "three";
import * as CANNON from "cannon-es";

export class Player extends Entity {
  leftHandPosition = new Vector3(0, 0, 0);
  rightHandPosition = new Vector3(0, 0, 0);
  cameraGroup;

  messages;
  //THREE, CANNON, camera, cameraGroup, map
  constructor(options) {
    super(options);
    this.cameraGroup = options.cameraGroup;
    this.camera = options.camera;
    this.listener = new THREE.AudioListener();
    this.camera.add(this.listener);
    this.vehicle = new YUKA.Vehicle();
    this.map.aiManager.add(this.vehicle);
    this.collisionFilterGroup = 2;
    this.collisionFilterMask = 5;
    let position = new CANNON.Vec3(0, 1, 0);
    this.bodyActor = new Actor({
      map: this.map,
      lifespan: undefined,
      position,
      velocity: undefined,
      rawShapeData: { size: 1 },
      noDie: true,
      mass: 1,
      invisible: true,
      bodySettings: { fixedRotation: true, material: "playerMaterial" },
      collisionFilterGroup: this.collisionFilterGroup,
      collisionFilterMask: this.collisionFilterMask,
      applyGravity: true
    });

    this.bodyActor.body.fixedRotation = true;
    this.bodyActor.body.linearDamping = 0.4;

    this.leftFireDebouncer = new Debouncer(1);
    this.rightFireDebouncer = new Debouncer(1);
    this.leftControllerGrip = options.leftControllerGrip;
    this.rightControllerGrip = options.rightControllerGrip;

    this.debouncers = [this.leftFireDebouncer, this.rightFireDebouncer];
    this.playerPos = undefined;
    this.messages = [];

    this.leftHandParticleSystem = new ParticleSystem({
      scene: this.scene,
      type: "left_hand",
      useLoaded: true
    });

    this.rightHandParticleSystem = new ParticleSystem({
      scene: this.scene,
      type: "right_hand",
      useLoaded: true
    });

    // add music
    this.music = new Sound({
      actor: this.bodyActor,
      player: this,
      name: "music01"
    });
  }

  updateAiTracking(dt) {
    const body = this.bodyActor.body;
    const vehicle = this.vehicle;
    vehicle.velocity.copy(body.velocity);
    vehicle.position.copy(body.position);
    vehicle.rotation.copy(body.quaternion);
  }

  update(dt) {
    const k = 0.05;

    this.updateAiTracking(dt);

    this.leftHandParticleSystem.setPosition(this.leftHandPosition);

    this.rightHandParticleSystem.setPosition(this.rightHandPosition);
    this.leftHandParticleSystem.update(dt);
    this.rightHandParticleSystem.update(dt);

    this.debouncers.forEach((debouncer) => {
      debouncer.update(dt);
    });

    this.cameraGroup.position.x =
      this.cameraGroup.position.x * k +
      this.bodyActor.body.position.x * (1 - k);

    this.cameraGroup.position.y =
      this.cameraGroup.position.y * k +
      this.bodyActor.body.position.y * (1 - k);

    this.cameraGroup.position.z =
      this.cameraGroup.position.z * k +
      this.bodyActor.body.position.z * (1 - k);

    this.cameraGroup.position.copy(this.bodyActor.body.position);
    //this.bodyActor.body.quaternion.copy(this.camera.quaternion);
    /* this.bodyActor.body.quaternion.setFromAxisAngle(
      new CANNON.Vec3(0, 0, 0),
      -Math.PI / 2
    );*/

    this.handleMessages(this.messages, dt);
    while (this.messages.pop()) {}
  }
  addMessage(message) {
    this.messages.push(message);
  }

  applyImpulseRelativeToController(useleftController, speed) {
    let direction = new THREE.Vector3();
    if (useleftController) {
      direction.copy(this.leftControllerGrip.position);
    } else {
      direction.copy(this.rightControllerGrip.position);
    }
    direction.x = direction.x - this.camera.position.x;
    direction.y = direction.y - this.camera.position.y;
    direction.z = direction.z - this.camera.position.z;
    direction.normalize();
    const force = new CANNON.Vec3(
      direction.x * speed,
      direction.y * speed,
      direction.z * speed
    );
    const pointOnBody = new CANNON.Vec3(0, 0, 0);
    this.bodyActor.body.applyImpulse(force, pointOnBody);
  }

  applyStoppingImpulseRelativeToController(useleftController, speed) {
    let direction = new THREE.Vector3();
    if (useleftController) {
      direction.copy(this.leftControllerGrip.position);
    } else {
      direction.copy(this.rightControllerGrip.position);
    }
    direction.x = direction.x - this.camera.position.x;
    direction.y = direction.y - this.camera.position.y;
    direction.z = direction.z - this.camera.position.z;
    direction.normalize();
    const force = new CANNON.Vec3(
      direction.x * speed,
      direction.y * speed,
      direction.z * speed
    );

    const currentVelocity = this.body.velocity;
    // let xDiff = Math.abs(currentVelocity.x - force.x);
    //let yDiff = Math.abs(currentVelocity.x - force.x);
    //let zDiff = Math.abs(currentVelocity.x - force.x);

    //force.x = force.x * xDiff * 0.1;
    //force.y = force.y * yDiff * 0.1;
    //force.z = force.z * zDiff * 0.1;
    const k = 0.01;

    force.x = this.getMinAbsoluteSignedValue(currentVelocity.x * k, force.x);
    force.y = this.getMinAbsoluteSignedValue(currentVelocity.y * k, force.y);
    force.z = this.getMinAbsoluteSignedValue(currentVelocity.z * k, force.z);

    const pointOnBody = new CANNON.Vec3(0, 0, 0);
    this.body.applyImpulse(force, pointOnBody);
  }

  getMinAbsoluteSignedValue(signedValue, value) {
    if (signedValue > 0) {
      return Math.min(signedValue, value);
    } else {
      return Math.max(signedValue, value);
    }
  }

  applyImpulseRelativeToCamera(speed) {
    let direction = new THREE.Vector3();

    direction.set(0, 0, 1);
    direction.unproject(this.camera);
    var ray = new THREE.Ray(
      this.camera.position,
      direction.sub(this.camera.position).normalize()
    );
    direction.copy(ray.direction);
    const force = new CANNON.Vec3(
      direction.x * speed,
      direction.y * speed,
      direction.z * speed
    );
    const pointOnBody = new CANNON.Vec3(0, 0, 0);
    this.bodyActor.body.applyImpulse(force, pointOnBody);
  }

  handleMessages(messages, dt) {
    for (const message of messages) {
      const useLeftController = message.useLeftController;
      /* Movement */
      if (message.forward) {
        this.applyImpulseRelativeToController(useLeftController, dt * 25);
      }
      if (message.backward) {
        this.applyStoppingImpulseRelativeToController(
          useLeftController,
          -dt * 25
        );
      }
      if (message.fire && this.rightFireDebouncer.tryFireAndReset()) {
        /* Fire */
      }
      if (message.magic) {
        switch (message.magic.shapeMatches[0].name) {
          case "square":
            new Actor({
              map: this.map,
              lifeSpan: undefined,
              rawShapeData: message.magic.shapeMatches[0],
              shapeType: "box",
              position: message.magic.position,
              bodySettings: {
                quaternion: message.magic.quaternion
              },
              velocity: this.bodyActor.body.velocity
            });
            break;
          case "circle":
            /*new Projectile({
              map: this.map,
              lifeSpan: undefined,
              rawShapeData: message.magic.shapeMatches[0],
              position: message.magic.position,
              bodySettings: {
                quaternion: message.magic.quaternion
              }
            });*/
            new Gun({
              map: this.map,
              lifeSpan: undefined,
              rawShapeData: message.magic.shapeMatches[0],
              position: message.magic.position,
              bodySettings: {
                quaternion: message.magic.quaternion
              },
              attachedTo: message.magic.attachedTo,
              collisionFilterGroup: this.collisionFilterGroup,
              collisionFilterMask: this.collisionFilterMask,
              reverseProjectile: true
            });

            break;
          default:
            console.error("No match found");
        }
      }
    }
  }

  get position() {
    return this.bodyActor.body.position;
  }

  get body() {
    return this.bodyActor.body;
  }

  get shouldBeDeleted() {
    return false;
  }
}
