import { Actor } from "./actor.js";
import { ParticleSystem } from "./particleSystem.js";
import { Sound } from "./sound.js";
import { Debouncer } from "./debouncer.js";
import { Projectile } from "./projectile.js";

export class Gun extends Actor {
  constructor(options) {
    options.shapeType ??= "sphere";
    options.bodySettings ??= {};
    options.bodySettings.fixedRotation = true;
    options.lifeSpan ??= 8;
    options.delay ??= 5;
    options.ghost = true;

    const size = options.rawShapeData.size;

    const blue = Math.min(-100 + size * 80, 255);
    const red = Math.max(Math.min(100 + size * 5, 255) - blue, 0);
    const green = 80 + size * 5 - blue;

    options.color ??= new options.THREE.Color(
      red / 255,
      green / 255,
      blue / 255
    );

    super(options);

    this.countDelay = options.countDelay ?? 2;
    this.debouncer = new Debouncer(this.countDelay);
    this.debouncers.push(this.debouncer);

    this.speed = options.speed ?? 15;

    this.body.linearDamping = 0;
    console.log("hex strinng = " + ("#" + this.color.getHexString()));
    this.particleSystems.push(
      new ParticleSystem({
        THREE: this.THREE,
        scene: this.scene,
        type: "fireball",
        colorA: "#" + this.color.getHexString()
      })
    );

    const light = new this.THREE.PointLight(
      this.color,
      this.size * this.size * 0.01,
      0,
      2
    );
    light.position.set(0, 0, 0);
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

    if (this.debouncer.tryFireAndReset() && !this.shouldBeKilled) {
      this.fire();
    }
  }

  fire() {
    new Projectile({
      THREE: this.THREE,
      CANNON: this.CANNON,
      map: this.map,
      lifeSpan: undefined,
      rawShapeData: this.rawShapeData,
      position: this.body.position,
      bodySettings: {
        quaternion: this.body.quaternion
      }
    });
  }
}
