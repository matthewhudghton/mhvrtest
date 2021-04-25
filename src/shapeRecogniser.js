import { Actor } from "./actor.js";
import { Debouncer } from "./debouncer.js";

export class ShapeRecogniser {
  constructor() {
    this.foo = 1;
  }

  getPoint(radius, angle) {
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
  }
}
