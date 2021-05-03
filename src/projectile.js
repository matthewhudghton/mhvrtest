import { Actor } from "./actor.js";
import { ParticleSystem } from "./particleSystem.js";
export class Projectile extends Actor {
  constructor(options) {
    options.shapeType ??= "sphere";
    options.bodySettings ??= {};
    options.bodySettings.fixedRotation = true;

    super(options);
    this.speed = options.speed ?? 15;
    this.body.linearDamping = 0;

    this.particleSystems.push(
      new ParticleSystem({
        THREE: this.THREE,
        scene: this.scene,
        type: "fireball"
      })
    );
  }

  update(dt) {
    Actor.prototype.update.call(this, dt);

    this.body.applyLocalImpulse(
      new this.CANNON.Vec3(0, 3.75 * dt, -this.speed * dt),
      new this.CANNON.Vec3(0, 0, 0)
    );
  }
}
