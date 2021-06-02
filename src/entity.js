import * as THREE from "three";
import * as CANNON from "cannon-es";

export class Entity {
  map;
  world;
  scene;
  children;
  constructor(options) {
    this.map = options.map;
    this.world = options.map.world;
    this.scene = options.map.scene;
    this.children = options.children ?? [];
  }
  update(dt) {
    this.children.forEach((child) => {
      child.update(dt);
    });
  }
}
