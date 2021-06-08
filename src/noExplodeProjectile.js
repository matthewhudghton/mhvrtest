import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Actor } from "./actor.js";
import { Explosion } from "./explosion.js";
import { ParticleSystem } from "./particleSystem.js";
import { Sound } from "./sound.js";
import { Projectile } from "./projectile.js";

export class noExplodeProject extends Projectile {
  constructor(options) {
    const size = options.rawShapeData.size;
    const blue = Math.min(-100 + size * 80, 255);
    const green = Math.max(Math.min(100 + size * 5, 255) - blue, 0);
    const red = 80 + size * 5 - blue;
    options.color ??= new THREE.Color(red / 255, green / 255, blue / 255);

    super(options);
  }

  collideEvent(event) {}
}
