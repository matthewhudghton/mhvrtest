import { Actor } from "./actor.js";

export class Block extends Actor {
  constructor(options) {
    options.shapeType ??= "box";
    options.bodySettings ??= {};
    options.bodySettings.fixedRotation = true;
    options.lifeSpan = undefined;
    options.invisible ??= false;
    options.applyGravity ??= false;
    options.bodySettings.mass ??= 0;

    const size = options.rawShapeData.size;

    const blue = Math.min(-100 + size * 80, 255);
    const red = Math.max(Math.min(100 + size * 5, 255) - blue, 0);
    const green = 80 + size * 5 - blue;

    options.color ??= new options.THREE.Color(
      red / 255,
      green / 255,
      blue / 255
    );
    console.log("rawShapeData" + JSON.stringify(options.rawShapeData));
    super(options);
  }

  kill() {}

  update(dt) {
    Actor.prototype.update.call(this, dt);
  }
}
