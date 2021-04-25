import { Actor } from "./actor.js";
import { Debouncer } from "./debouncer.js";

export class ShapeRecogniser {
  constructor() {
    this.points = [];
    this.maxX = -Number.MAX_VALUE;
    this.minX = Number.MAX_VALUE;
    this.maxY = -Number.MAX_VALUE;
    this.minY = Number.MAX_VALUE;
    this.xCount = 100;
    this.yCount = 100;
  }

  addPoint(x, y) {
    this.points.push([x, y]);
    this.minX = Math.min(this.minX, x);
    this.maxX = Math.max(this.maxX, x);
    this.minY = Math.min(this.minY, y);
    this.maxY = Math.max(this.maxY, y);
  }

  normalisePoints(points) {
    //  ~~ is a fast bitwise way to convert to int
    return points.map((p) => [
      ~~(((p[0] - this.minX) / (this.maxX - this.minX)) * this.xCount),
      ~~(((p[1] - this.minY) / (this.maxY - this.minY)) * this.yCount)
    ]);
  }

  print() {
    let logString = `
    x: ${this.minX} ${this.maxX}
    y: ${this.minY} ${this.maxY}
    `;
    console.log(logString);
    let normalisedPoints = this.normalisePoints(this.points);
    console.log(normalisedPoints);
  }
}
