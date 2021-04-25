import { Actor } from "./actor.js";
import { Debouncer } from "./debouncer.js";

export class ShapeRecogniser {
  constructor() {
    this.points = [];
    this.maxX = -Number.MAX_VALUE;
    this.minX = Number.MAX_VALUE;
    this.maxY = -Number.MAX_VALUE;
    this.minY = Number.MAX_VALUE;
  }

  addPoint(x, y) {
    this.points.push([x, y]);
    this.minX = Math.min(this.minX, x);
    this.maxX = Math.max(this.maxX, x);
    this.minY = Math.min(this.minY, y);
    this.maxY = Math.max(this.maxY, y);
  }
  print() {
    let logString = `x ${this.minX}`;

    console.log(logString);
  }
}
