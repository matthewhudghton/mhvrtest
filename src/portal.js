import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Actor } from "./actor.js";
import { Explosion } from "./explosion.js";
import { ParticleSystem } from "./particleSystem.js";
import { Sound } from "./sound.js";
import { Debouncer } from "./debouncer.js";
import { Projectile } from "./projectile.js";

export class Portal extends Projectile {
  constructor(options) {
    options.rawShapeData ??= {};

    options.rawShapeData.size ??= 0.1;
    //options.rawShapeData.width ??= 0.1;
    //options.rawShapeData.height ??= 3;
    //options.rawShapeData.depth ??= 0.1;

    //options.shapeType ??= "box";
    //options.rawShapeData.size ??= 3;

    options.spritePath ??= "sprites/portal01.png";

    options.bodySettings.fixedRotation = true;
    //options.bodySettings.bodyType = CANNON.Body.KINEMATIC;
    options.speed ??= 0.0;
    options.canExplode ??= false;
    options.noDie ??= true;
    options.mass = 5;
    options.canTravelPortal ??= false;
    options.invisible ??= true;

    super(options);

    this.portalDestination = options.portalDestination;

    this.rechargeDelay = new Debouncer(1, 1);
    this.debouncers.push(this.rechargeDelay);
  }
  initSounds() {}
  initParticles() {}

  update(dt) {
    /* Check debouncer before update, so we can tell if its been fired */
    if (this.rechargeDelay.hasFiredLastUpdate()) {
      this.particleSystems.push(
        new ParticleSystem({
          scene: this.scene,
          type: "fireball",
          colorA: "#" + this.color.getHexString(),
          scaleA: this.spriteHeight,
          scaleB: this.spriteHeight * 0.5,
          position: this.body.position,
          radialVelocityY: 1 + 10 * this.spriteHeight,
          radialVelocityZ: 1 + 10 * this.spriteHeight,
          radialVelocityRadius: 14 * this.spriteHeight,
          particlesMax: 5,
          useLoaded: false,
          particlesMin: 2,
          emitterLife: 0.5
        })
      );

      this.sounds.push(
        new Sound({
          actor: this,
          player: this.map.player,
          duration: 10,
          loop: false,
          name: "portal01"
        })
      );
    }
    /* Delete particle system from previous fires */
    if (this.rechargeDelay.shouldFire) {
      this.particleSystems.forEach((particleSystem) => {
        if (!particleSystem.hasParticles) {
          particleSystem.delete();
        }
      });
      // stop any sounds being played
      this.sounds.forEach((sound) => {
        sound.kill();
      });

      this.sounds = [];
    }

    Projectile.prototype.update.call(this, dt);
  }

  collideEvent(event) {
    if (event.target?.userData?.actor?.portalDestination) {
      const portal = event.target.userData.actor;
      const otherPortal = event.target.userData.actor.portalDestination;
      if (otherPortal?.body?.position !== undefined) {
        if (event.body?.userData?.actor?.canTravelPortal) {
          //event.body.userData.actor.newPosition = new CANNON.Vec3(0, 0, 0);
          if (
            otherPortal.rechargeDelay.tryFireAndReset() &&
            portal.rechargeDelay.tryFireAndReset()
          ) {
            event.body.userData.actor.newPosition = otherPortal.body.pointToWorldFrame(
              new CANNON.Vec3(0, 0, otherPortal.size + 0.8)
            );
          }
        }
      }
    }
  }
}
