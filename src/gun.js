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
    options.lifeSpan ??= 3;
    options.delay ??= 0.3;
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

    this.particleSystems.push(
      new ParticleSystem({
        THREE: this.THREE,
        scene: this.scene,
        type: "gun1",
        colorA: "#" + this.color.getHexString(),
        useSpring: true,
        position: this.body.position,
        useEmitterRotate: true,
        emitterRotateX: 1,
        emitterRotateY: 1,
        emitterRotateZ: 1,
        driftX: 5 * size,
        driftY: 5 * size,
        driftZ: 5 * size,
        rotateX: 10,
        rotateY: 10,
        rotateZ: 10,
        scaleA: 0.5 * size,
        scaleB: 0.2 * size,
        radialVelocityRadius: size * 3
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
