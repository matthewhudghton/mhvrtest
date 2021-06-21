import { Debouncer } from "./debouncer.js";
import * as THREE from "three";
export class ChargeBar extends Debouncer {
  constructor(options) {
    super(options.maxCharge, options.currentCharge, options.rechargeRate);
    //this.background =
    this.sprites = [];
    this.width = options.width;
    this.height = options.height;

    this.backgroundSprite = this.addBarSprite(
      options.width,
      options.height,
      1,
      options.opacity,
      options.backgroundColor
    );

    this.foregroundSprite = this.addBarSprite(
      options.width - 0.05,
      options.height - 0.05,
      1,
      options.opacity,
      options.foregroundColor
    );

    this.sprites.push(this.backgroundSprite);
    this.sprites.push(this.foregroundSprite);
  }

  addBarSprite(width, height, depth, opacity, color) {
    const material = new THREE.SpriteMaterial({
      color: color
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(width, height, depth);
    sprite.center = new THREE.Vector2(0, 0.5);
    sprite.material.opacity = opacity;
    this.sprites.push(sprite);
    return sprite;
  }

  update(dt) {
    Debouncer.prototype.update.call(this, dt);
    this.foregroundSprite.scale.set(
      this.width * this.fractionComplete,
      this.height,
      1
    );
  }
}
