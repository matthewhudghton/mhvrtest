import { Debouncer } from "./debouncer.js";
import * as THREE from "three";
export class ChargeBar extends Debouncer {
  constructor(options) {
    super(options.maxCharge, options.currentCharge, options.rechargeRate);
    //this.background =
    this.sprites = [];

    this.backgroundSprite = this.addBarSprite(
      options.width,
      options.height,
      1,
      options.opacity,
      options.color
    );
    this.sprites.push(this.backgroundSprite);
  }

  addBarSprite(width, height, depth, opacity, color) {
    const material = new THREE.SpriteMaterial({
      color: color
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(width, height, depth);
    sprite.material.opacity = opacity;
    this.sprites.push(sprite);
  }
}
