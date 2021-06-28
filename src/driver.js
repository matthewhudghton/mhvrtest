import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Entity } from "./entity.js";
import { Actor } from "./actor.js";
import { SpotLightHelper } from "three";
import { Gun } from "./gun.js";
import { Debouncer } from "./debouncer.js";
import { ChargeBar } from "./chargeBar.js";

export class Driver extends Entity {
  constructor(options) {
    super(options);

    this.collisionFilterGroup = options.collisionFilterGroup ?? 4;
    this.collisionFilterMask = options.collisionFilterMask ?? 3;
    this.size = options.size ?? 1;

    this.actor = new Actor({
      map: this.map,
      shapeType: "box",
      ai: this,
      lifespan: undefined,
      velocity: undefined,
      position: options.position,
      applyGravity: false,
      mass: 5,
      maxHealth: 100,
      color: new THREE.Color(Math.random(), Math.random(), Math.random()),
      rawShapeData: {
        size: this.size,
        width: this.size / 3,
        height: this.size / 5,
        depth: this.size / 2
      },
      bodySettings: {
        material: "playerMaterial",
        angularDamping: 0.8,
        linearDamping: 0.6
      },
      collisionFilterGroup: this.collisionFilterGroup,
      collisionFilterMask: this.collisionFilterMask
    });
    this.map.ais.push(this);
    this.debouncer = new Debouncer(this.size + 2 + Math.random() * 4);
    /*
    new ChargeBar({
      maxCharge: this.size + 2 + Math.random() * 4,
      width: 1,
      height: 0.1,
      offsetY: this.actor.body.aabb.lowerBound.y,
      opacity: 1,
      backgroundColor: new THREE.Color(0.2, 0.1, 0.2),
      foregroundColor: new THREE.Color(0.05, 0.95, 0.05)
    });*/
    /*this.actor.mesh.add(this.debouncer.sprites[0]);
    this.actor.mesh.add(this.debouncer.sprites[1]);
    */

    this.shouldBeDeleted = false;
  }

  update(dt) {
    if (this.shouldBeDeleted) {
      return;
    }

    let direction = this.localDirectionToTargetDelta;
    let speed = 80 * this.actor.body.mass;
    let turnSpeed = 5;
    let stopDistanceSquared = 10;
    this.debouncer.update(dt);
    if (this.distanceSquaredToTarget < stopDistanceSquared) {
      speed = -speed;
    }

    this.body.applyLocalForce(
      new CANNON.Vec3(
        direction.x * dt * this.actor.body.mass * turnSpeed,
        0,
        0
      ),
      new CANNON.Vec3(1 * this.size, 0, 0)
    );

    this.body.applyLocalForce(
      new CANNON.Vec3(0, 0, speed * this.actor.body.mass * dt),
      new CANNON.Vec3(0, 0, 1 * this.size)
    );
    this.body.applyLocalForce(
      new CANNON.Vec3(
        -direction.x * dt * this.actor.body.mass * turnSpeed,
        -direction.y * dt * this.actor.body.mass * turnSpeed,
        0
      ),
      new CANNON.Vec3(0, 0, -1 * this.size)
    );

    if (this.position.y < 1) {
      this.body.applyImpulse(
        new CANNON.Vec3(
          0,
          -this.map.gravity * 1.01 * this.actor.body.mass * dt,
          0
        ),
        new CANNON.Vec3(0, 0, 0)
      );
    }

    let angleFireTollerance = 0.5 * Math.PI;

    if (
      this.angleToTarget < angleFireTollerance &&
      this.debouncer.tryFireAndReset()
    ) {
      new Gun({
        map: this.map,
        lifeSpan: undefined,
        collisionFilterGroup: this.collisionFilterGroup,
        collisionFilterMask: this.collisionFilterMask,
        rawShapeData: {
          name: "circle",
          size: this.size
        },
        position: this.position,
        bodySettings: {
          quaternion: this.quaternion
        },
        attachedTo: this.actor.mesh
      });
    }
  }

  get angleToTarget() {
    let direction = new THREE.Vector3(0, 0, 1);
    this.actor.mesh.localToWorld(direction);
    let moveToTarget = this.moveToTarget;

    return direction.angleTo(
      new THREE.Vector3(moveToTarget.x, moveToTarget.y, moveToTarget.z)
    );
  }
  get moveToTarget() {
    return new CANNON.Vec3(0, 1, 0).vadd(
      this.map.player.bodyActor.body.position
    );
  }

  get distanceSquaredToTarget() {
    return this.body.position.distanceSquared(this.moveToTarget);
  }

  get body() {
    return this.actor.body;
  }
  get position() {
    return this.actor.body.position;
  }

  get quaternion() {
    return this.actor.body.quaternion;
  }

  get localDirectionToTargetDelta() {
    let direction = new CANNON.Vec3(0, 0, 0);
    this.body.pointToLocalFrame(this.moveToTarget, direction);
    direction.normalize();
    return direction;

    /*
    let direction = new CANNON.Vec3(0, 0, 0);
    let newQuaternion = new CANNON.Quaternion();
    this.moveToTarget.sub(this.position, direction);
    direction.normalize();
    newQuaternion.copy(this.quaternion);
    let bodyDirection = new CANNON.Vec3(0, 0, 1);
    let result = newQuaternion.vmult(bodyDirection);
    let inverseQuaternion = new CANNON.Quaternion();
    newQuaternion.inverse(inverseQuaternion);
    result = inverseQuaternion.vmult(result);
    return result;*/
  }

  kill() {
    this.shouldBeDeleted = true;
  }
}
