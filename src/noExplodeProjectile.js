import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Actor } from "./actor.js";
import { Explosion } from "./explosion.js";
import { ParticleSystem } from "./particleSystem.js";
import { Sound } from "./sound.js";
import { Projectile } from "./projectile.js";

export class NoExplodeProjectile extends Projectile {
  constructor(options) {
    const size = options.rawShapeData.size;
    const blue = Math.min(-100 + size * 80, 255);
    const green = Math.max(Math.min(100 + size * 5, 255) - blue, 0);
    const red = 80 + size * 5 - blue;
    options.spritePath ??= "sprites/deflect01.png";
    options.color ??= new THREE.Color(red / 255, green / 255, blue / 255);
    options.bodySettings.fixedRotation = false;
    options.speed ??= 30;
    super(options);
  }

  collideEvent(event) {}
}
