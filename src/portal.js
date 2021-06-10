import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Actor } from "./actor.js";
import { Explosion } from "./explosion.js";
import { ParticleSystem } from "./particleSystem.js";
import { Sound } from "./sound.js";
import { Projectile } from "./projectile.js";

export class Portal extends Projectile {
  constructor(options) {
    options.rawShapeData ??= {};
    //options.rawShapeData.size = 5;

    const size = options.rawShapeData.size;
    const blue = Math.min(-100 + size * 80, 255);
    const green = Math.max(Math.min(100 + size * 5, 255) - blue, 0);
    const red = 80 + size * 5 - blue;
    options.spritePath ??= "sprites/portal01.png";
    options.color ??= new THREE.Color(red / 255, green / 255, blue / 255);
    options.bodySettings.fixedRotation = false;
    //options.bodySettings.bodyType = CANNON.Body.KINEMATIC;
    options.speed ??= 0.0;
    options.canExplode ??= false;
    options.noDie ??= true;
    options.mass = 5;
    options.canTravelPortal ??= false;

    super(options);

    this.portalDestination = options.portalDestination;
  }
  initSounds() {}
  //initParticles() {}
  collideEvent(event) {
    if (event.target?.userData?.actor?.portalDestination) {
      const otherPortal = event.target.userData.actor.portalDestination;
      if (otherPortal?.body?.position !== undefined) {
        if (event.body?.userData?.actor?.canTravelPortal) {
          //event.body.userData.actor.newPosition = new CANNON.Vec3(0, 0, 0);
          event.body.userData.actor.newPosition = otherPortal.body.pointToWorldFrame(
            new CANNON.Vec3(0, 0, otherPortal.size + 0.2)
          );
        }
      }
    }
  }
}
