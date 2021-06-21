import { Debouncer } from "./debouncer.js";
import * as THREE from "three";
export class ChargeBar extends Debouncer {
  constructor(options) {
    super(options.maxCharge, options.currentCharge, options.rechargeRate);
    //this.background =
    this.sprites = [];

    this.backgroundSprite = this.createBarSprite(
      options.width,
      options.height,
      1,
      options.opacity
    );
    this.sprites.push(this.backgroundSprite);
  }

  addBarSprite(width, height, depth, opacity) {
    const material = new THREE.SpriteMaterial({
      color: this.color
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(width, height, depth);
    sprite.material.opacity = opacity;
    this.sprites.push(sprite);
  }
}
