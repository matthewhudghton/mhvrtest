import { Actor } from "./actor.js";
import { ParticleSystem } from "./particleSystem.js";
import { Sound } from "./sound.js";

export class Projectile extends Actor {
  constructor(options) {
    options.shapeType ??= "sphere";
    options.bodySettings ??= {};
    options.bodySettings.fixedRotation = true;
    options.lifeSpan ??= 8;
    const size = options.rawShapeData.size;

    const green = size * 5;
    const blue = Math.min(-100 + size * 80, 255);
    const red = Math.max(Math.min(100 + size * 5, 255) - blue, 0);

    options.color ??= new options.THREE.Color(red, green, blue);

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

    const light = new this.THREE.PointLight(this.color, 1, this.size * 100, 1);
    light.position.set(50, 50, 50);
    this.lights.push(light);
    this.mesh.add(light);

    this.sounds.push(
      new Sound({
        THREE: this.THREE,
        actor: this,
        player: this.map.player,
        detune: (5 - this.size) * 1000
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
