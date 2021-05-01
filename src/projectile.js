import { Actor } from "./actor.js";
export class Projectile extends Actor {
  constructor(options) {
    options.shapeType ??= "sphere";
    super(options);
    this.body.applyLocalForce(
      new this.CANNON.Vec3(0, 0, 1),
      new this.CANNON.Vec3(0, 0, 0)
    );
  }
}
