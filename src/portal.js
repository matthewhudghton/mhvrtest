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
  }
  initSounds() {}
  initParticles() {}
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
