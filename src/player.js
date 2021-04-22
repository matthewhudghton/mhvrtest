import { Actor } from "./actor";

export class Player {
  constructor(THREE, CANNON, cameraGroup, map) {
    this.THREE = THREE;
    this.CANNON = CANNON;
    this.cameraGroup = cameraGroup;
    let position = new CANNON.Vec3(0, 1, 0);
    this.bodyActor = new Actor(THREE, CANNON, map, undefined, position);
    this.playerPos = undefined;
  }

  update(dt) {}

  delete() {}

  get shouldBeDeleted() {
    return false;
  }
}
