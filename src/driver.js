import { Entity } from "./entity.js";
import { Actor } from "./actor.js";
import { SpotLightHelper } from "three";
import * as CANNON from "cannon";

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
      bodySettings: { material: "playerMaterial" }
    });
    this.map.ais.push(this);
  }

  update(dt) {
    let direction = this.localDirectionToTargetDelta;
    let speed = 1;
    this.body.applyLocalForce(
      new CANNON.Vec3(direction.x, 0, 0),
      new CANNON.Vec3(1, 0, 0)
    );

    this.body.applyLocalForce(
      new CANNON.Vec3(0, direction.y, 0),
      new CANNON.Vec3(0, 0, 1 * dt)
    );
    this.body.applyLocalForce(
      new CANNON.Vec3(0, -direction.y, 0),
      new CANNON.Vec3(0, 0, -1 * dt)
    );
  }

  get moveToTarget() {
    return this.map.player.bodyActor.body.position;
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
}
