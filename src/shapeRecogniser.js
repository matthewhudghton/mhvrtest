import { Actor } from "./actor.js";
import { Debouncer } from "./debouncer.js";

export class ShapeRecogniser {
  constructor() {
    this.points = [];
    this.maxX = -Number.MAX_VALUE;
    this.minX = Number.MAX_VALUE;
    this.maxY = -Number.MAX_VALUE;
    this.minY = Number.MAX_VALUE;
    this.xCount = 10;
    this.yCount = 10;
    this.matrix = new Array(this.xCount)
      .fill(0)
      .map(() => new Array(this.yCount));
  }

  addPoint(x, y, time) {
    this.points.push([x, y, time]);
    this.minX = Math.min(this.minX, x);
    this.maxX = Math.max(this.maxX, x);
    this.minY = Math.min(this.minY, y);
    this.maxY = Math.max(this.maxY, y);
  }

  normalisePoints(points) {
    //  ~~ is a fast bitwise way to convert to int
    return points.map((p) => [
      ~~(((p[0] - this.minX) / (this.maxX - this.minX)) * (this.xCount - 1)),
      ~~(((p[1] - this.minY) / (this.maxY - this.minY)) * (this.yCount - 1)),
      p[2]
    ]);
  }
  initMatrix(points) {
    console.log("points = ", points);
    let previousPoint;
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      let x = p[0];
      let y = p[1];
      if (!this.matrix[x][y]) {
        this.matrix[x][y] = [];
      }
      const diff =
        previousPoint !== undefined
          ? [x - previousPoint[0], y - previousPoint[1]]
          : undefined;
      this.matrix[x][y].push([p[2], diff]);
      previousPoint = p;
    }
  }

  getCharForVector(vector) {
    let x = vector[0];
    let y = vector[1];
    if (x > 0 && x > y) {
      return "<";
    }
    if (x < 0 && x < y) {
      return ">";
    }
    if (y > 0) {
      return "^";
    }
    if (y < 0) {
      return "v";
    }
    return "#";
  }
  printMatrix(matrix) {
    let message = "";
    for (let y = 0; y < this.yCount; y++) {
      for (let x = 0; x < this.xCount; x++) {
        message +=
          matrix[x][y] && matrix[x][y].length > 0 && matrix[x][y][0][1]
            ? this.getCharForVector(matrix[x][y][0][1])
            : ".";
      }
      message += "\n";
    }
    console.log(message);
  }
  print() {
    let logString = `
    x: ${this.minX} ${this.maxX}
    y: ${this.minY} ${this.maxY}
    `;
    console.log(logString);
    let normalisedPoints = this.normalisePoints(this.points);
    console.log(normalisedPoints);
    this.initMatrix(normalisedPoints);
    console.log("this.matrix", this.matrix);
    this.printMatrix(this.matrix);
    this.checkForShape(normalisedPoints);
  }

  checkForShape(points) {
    let previousPoint;
    let shape = [
      [1, 0],
      [0, -1],
      [-1, 0],
      [0, 1]
    ];
    let index = 0;
    let tries = 0;
    let maxTries = 5;
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (previousPoint !== undefined) {
        const x = p[0] - previousPoint[0];
        const y = p[1] - previousPoint[1];
        let xDir = x > 0 ? 1 : x < 0 ? -1 : 0;
        let yDir = y > 0 ? 1 : y < 0 ? -1 : 0;
        if (xDir != 0 || yDir != 0) {
          console.log(xDir, yDir, index, tries);
          if (index >= shape.length) {
            console.log("Match!!!");
            return true;
          }
          if (shape[index][0] == xDir && shape[index][1] == yDir) {
            index++;
          } else if (index > 0) {
            if (shape[index - 1][0] != xDir || shape[index - 1][1] != yDir) {
              tries++;
              if (tries > maxTries) {
                tries = 0;
                index = 0;
              }
            }
          }
        }
      }
      previousPoint = p;
    }
  }
}
