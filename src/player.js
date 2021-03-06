import { Vector3 } from "three";
import { Actor } from "./actor.js";
import { Debouncer } from "./debouncer.js";
import { Entity } from "./entity.js";
import { Gun } from "./gun.js";
import { NoExplodeProjectile } from "./noExplodeProjectile.js";
import { Portal } from "./portal.js";
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
    this.grabRange = 25;
    let position = new CANNON.Vec3(0, 1, 0);
    this.bodyActor = new Actor({
      map: this.map,
      lifespan: undefined,
      position,
      velocity: undefined,
      shapeType: "box",
      invisible: true,
      rawShapeData: { size: 1, height: 3.1, width: 0.5, depth: 0.5 },
      noDie: true,
      mass: 10,
      bodySettings: {
        fixedRotation: true,
        material: "playerMaterial",
        angularDamping: 0.8
      },
      collisionFilterGroup: this.collisionFilterGroup,
      collisionFilterMask: this.collisionFilterMask,
      applyGravity: true
    });

    this.bodyActor.body.fixedRotation = true;
    this.bodyActor.body.linearDamping = 0.4;
    this.firstOfPortalPair = undefined;
    this.leftFireDebouncer = new Debouncer(1);
    this.rightFireDebouncer = new Debouncer(1);
    this.leftControllerGrip = options.leftControllerGrip;
    this.rightControllerGrip = options.rightControllerGrip;
    this.grabConstraints = [[], []];
    this.grabForce = 25000;
    this.debouncers = [this.leftFireDebouncer, this.rightFireDebouncer];
    this.playerPos = undefined;
    this.messages = [];
    /*
    this.leftHandParticleSystem = new ParticleSystem({
      scene: this.scene,
      type: "left_hand",
      useLoaded: true
    });

    this.rightHandParticleSystem = new ParticleSystem({
      scene: this.scene,
      type: "right_hand",
      useLoaded: true
    });*/

    // add music
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

    /*
// disabling for speed
    this.leftHandParticleSystem.setPosition(this.leftHandPosition);
    this.rightHandParticleSystem.setPosition(this.rightHandPosition);
    this.leftHandParticleSystem.update(dt);
    this.rightHandParticleSystem.update(dt);*/

    this.debouncers.forEach((debouncer) => {
      debouncer.update(dt);
    });

    this.cameraGroup.position.x =
      this.cameraGroup.position.x * k +
      this.bodyActor.body.position.x * (1 - k);

    this.bodyActor.body.quaternion.slerp(
      new CANNON.Quaternion(0, 0, 0, 0),
      Math.min(1 * dt, 1),
      this.bodyActor.body.quaternion
    );
    /*
    const amount = 500000 * dt;
    this.bodyActor.body.applyImpulse(
      new CANNON.Vec3(0, amount, 0),
      new CANNON.Vec3(10, 10, 10)
    );
    this.bodyActor.body.applyImpulse(
      new CANNON.Vec3(0, -amount, 0),
      new CANNON.Vec3(10, -10, 10)
    ); */
    const amount = 700 * dt * this.body.mass;
    let euler = new CANNON.Vec3(0, 0, 0);
    this.body.quaternion.toEuler(euler);
    if (Math.abs(euler.x) < 0.2) {
      euler.x = 0;
    }
    if (Math.abs(euler.y) < 0.2) {
      euler.y = 0;
    }
    if (Math.abs(euler.z) < 0.2) {
      euler.z = 0;
    }
    this.body.applyTorque(
      new CANNON.Vec3(-euler.x * amount, -euler.y * amount, -euler.z * amount)
    );

    this.cameraGroup.position.y =
      this.cameraGroup.position.y * k +
      this.bodyActor.body.position.y * (1 - k);

    this.cameraGroup.position.z =
      this.cameraGroup.position.z * k +
      this.bodyActor.body.position.z * (1 - k);

    this.cameraGroup.position.copy(this.bodyActor.body.position);

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
        this.applyImpulseRelativeToController(
          useLeftController,
          dt * 25 * this.body.mass
        );
      }
      if (message.backward) {
        this.applyStoppingImpulseRelativeToController(
          useLeftController,
          -dt * 25 * this.body.mass
        );
      }
      if (message.fire && this.rightFireDebouncer.tryFireAndReset()) {
        /* Fire */
      }
      if (message.magic) {
        switch (message.magic.shapeMatches[0].name) {
          case "square":
            message.magic.shapeMatches[0].width *= 2;
            message.magic.shapeMatches[0].height *= 2;
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
            message.magic.shapeMatches[0].size +=
              0.2 *
              (message.magic.shapeMatches[0].size *
                message.magic.shapeMatches[0].size);

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
          /* Deflect */
          case "deflect":
            new NoExplodeProjectile({
              map: this.map,
              lifeSpan: undefined,
              rawShapeData: message.magic.shapeMatches[0],
              position: message.magic.position,
              bodySettings: {
                quaternion: message.magic.quaternion
              },
              collisionFilterGroup: this.collisionFilterGroup,
              collisionFilterMask: this.collisionFilterMask,
              reverseProjectile: true
            });
            break;
          case "portal":
            let newPortal = new Portal({
              map: this.map,
              lifeSpan: undefined,
              rawShapeData: message.magic.shapeMatches[0],
              position: message.magic.position,
              bodySettings: {
                quaternion: message.magic.quaternion
              },
              collisionFilterGroup: 1,
              collisionFilterMask: this.collisionFilterMask | 2,
              reverseProjectile: true,
              portalDestination: this.firstOfPortalPair,
              color: this.firstOfPortalPair
                ? this.firstOfPortalPair.color
                : new THREE.Color(0xffffff).setHex(Math.random() * 0xffffff)
            });
            // link pairs of portals together
            if (this.firstOfPortalPair) {
              this.firstOfPortalPair.portalDestination = newPortal;
              this.firstOfPortalPair = undefined;
            } else {
              this.firstOfPortalPair = newPortal;
            }

            break;
          default:
            console.error("No match found");
        }
      }
      if (message.grab) {
        this.doGrab(message.grab);
      }
      if (message.releaseGrab) {
        this.releaseGrab(message.releaseGrab);
      }
    }
  }

  doGrab(grabMessage) {
    const threeStartPosition = grabMessage.position;
    const startPosition = new CANNON.Vec3(
      threeStartPosition.x,
      threeStartPosition.y,
      threeStartPosition.z
    );
    const threeQuaternion = grabMessage.quaternion;
    const quaternion = new CANNON.Quaternion(
      threeQuaternion.x,
      threeQuaternion.y,
      threeQuaternion.z,
      threeQuaternion.w
    );
    const currentConstraints = this.grabConstraints[grabMessage.index];
    /* Don't grab if already holding something in that hand */
    if (currentConstraints.length !== 0) {
      return;
    }

    const line = new CANNON.Vec3(0, 0, -this.grabRange);

    const ray = new CANNON.Ray(
      startPosition,
      quaternion.vmult(line, line).vadd(startPosition)
    );

    if (ray.intersectWorld(this.map.world, { mode: CANNON.RAY_MODES.ALL })) {
      const body = ray.result.body;

      //const constraint = new CANNON.DistanceConstraint(this.body, body, 5, 10);

      const constraint = new CANNON.PointToPointConstraint(
        grabMessage.body,
        new CANNON.Vec3(0, 0, -0.05),
        body,
        body.pointToLocalFrame(ray.result.hitPointWorld),
        this.grabForce
      );
      currentConstraints.push(constraint);
      /*
      const points = [];
      points.push(new THREE.Vector3(ray.from.x, ray.from.y, ray.from.z));
      points.push(
        new THREE.Vector3(
          ray.result.hitPointWorld.x,
          ray.result.hitPointWorld.y,
          ray.result.hitPointWorld.z
        )
      );
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const drawLine = new THREE.Line(geometry, new THREE.MeshBasicMaterial());
      this.map.scene.add(drawLine);
      */

      this.map.world.addConstraint(constraint);
    }
    /*
    // Debug code to draw lines for ray cast
    const points = [];
    points.push(new THREE.Vector3(ray.from.x, ray.from.y, ray.from.z));
    points.push(new THREE.Vector3(ray.to.x, ray.to.y, ray.to.z));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const drawLine = new THREE.Line(geometry, new THREE.MeshBasicMaterial());
    this.map.scene.add(drawLine);*/
  }

  releaseGrab(grabMessage) {
    const currentConstraints = this.grabConstraints[grabMessage.index];
    currentConstraints.forEach((constraint) => {
      this.map.world.removeConstraint(constraint);
    });

    this.grabConstraints[grabMessage.index] = [];
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
