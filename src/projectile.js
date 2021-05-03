import { Actor } from "./actor.js";
export class Projectile extends Actor {
  constructor(options) {
    options.shapeType ??= "sphere";
    options.bodySettings ??= {};
    options.bodySettings.fixedRotation = true;
    super(options);

    this.body.linearDamping = 0;
  }

  update(dt) {
    Actor.prototype.update.call(this, dt);

    this.body.applyLocalImpulse(
      new this.CANNON.Vec3(0, 3.75 * dt, 10 * dt),
      new this.CANNON.Vec3(0, 0, 0)
    );
  }
}
