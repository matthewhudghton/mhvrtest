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

  update(dt) {
    const k = 0.05;

    this.cameraGroup.position.x =
      this.cameraGroup.position.x * k +
      this.bodyActor.body.position.x * (1 - k);

    this.cameraGroup.position.y =
      this.cameraGroup.position.y * k +
      this.bodyActor.body.position.y * (1 - k);

    this.cameraGroup.position.z =
      this.cameraGroup.position.z * k +
      this.bodyActor.body.position.z * (1 - k);
  }

  delete() {}

  get shouldBeDeleted() {
    return false;
  }
}
