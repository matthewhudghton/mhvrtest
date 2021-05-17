import { Entity } from "./entity.js";
import { Actor } from "./actor.js";
import { SpotLightHelper } from "three";
import { Gun } from "./gun.js";
import * as CANNON from "cannon";
import { Debouncer } from "./debouncer.js";

export class Driver extends Entity {
  constructor(options) {
    super(options);

    this.actor = new Actor({
      THREE: this.THREE,
      CANNON: this.CANNON,
      map: this.map,
      shapeType: "cone",
      ai: this,
      lifespan: undefined,
      velocity: undefined,
      position: options.position,
      mass: 1,
      rawShapeData: { size: 1, width: 0.5, height: 0.5 },
      bodySettings: { material: "playerMaterial" }
    });
    this.map.ais.push(this);
    this.debouncer = new Debouncer(4 + Math.random() * 4);
    this.shouldBeDeleted = false;
  }

  update(dt) {
    if (this.shouldBeDeleted) {
      return;
    }
    let direction = this.localDirectionToTargetDelta;
    let speed = 2;
    let stopDistanceSquared = 38;
    this.debouncer.update(dt);
    if (this.distanceSquaredToTarget < stopDistanceSquared) {
      speed = -2;
    }

    this.body.applyLocalForce(
      new CANNON.Vec3(direction.x, 0, 0),
      new CANNON.Vec3(1, 0, 0)
    );

    this.body.applyLocalForce(
      new CANNON.Vec3(direction.x, direction.y, speed * dt),
      new CANNON.Vec3(0, 0, 1 * dt)
    );
    this.body.applyLocalForce(
      new CANNON.Vec3(-direction.x, -direction.y, 0),
      new CANNON.Vec3(0, 0, -1 * dt)
    );

    this.body.applyImpulse(
      new this.CANNON.Vec3(0, 3.75 * dt, 0),
      this.body.position
    );

    let angleFireTollerance = 0.5 * Math.PI;
    //console.log(this.angleToTarget, angleFireTollerance);
    if (
      this.angleToTarget < angleFireTollerance &&
      this.debouncer.tryFireAndReset()
    ) {
      new Gun({
        THREE: this.THREE,
        CANNON: this.CANNON,
        map: this.map,
        lifeSpan: undefined,
        collisionFilterGroup: 1,
        collisionFilterMask: 2,
        rawShapeData: { name: "cirle", size: 1, height: 1, width: 1 },
        position: this.position,
        bodySettings: {
          quaternion: this.quaternion
        },
        attachedTo: this.actor.mesh
      });
    }
  }

  get angleToTarget() {
    let direction = new this.THREE.Vector3(0, 0, 1);
    this.actor.mesh.localToWorld(direction);
    let moveToTarget = this.moveToTarget;

    return direction.angleTo(
      new this.THREE.Vector3(moveToTarget.x, moveToTarget.y, moveToTarget.z)
    );
  }
  get moveToTarget() {
    return this.map.player.bodyActor.body.position;
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
