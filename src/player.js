import { Actor } from "./actor";

export class Player {
  constructor(THREE, CANNON, camera, cameraGroup, map) {
    this.THREE = THREE;
    this.CANNON = CANNON;
    this.cameraGroup = cameraGroup;
    this.camera = camera;
    let position = new CANNON.Vec3(0, 1, 0);
    this.bodyActor = new Actor(THREE, CANNON, map, undefined, position);
    this.playerPos = undefined;
    this.messages = [];
  }

  update(dt) {
    const k = 0.05;
    /*
    this.cameraGroup.position.x =
      this.cameraGroup.position.x * k +
      this.bodyActor.body.position.x * (1 - k);

    this.cameraGroup.position.y =
      this.cameraGroup.position.y * k +
      this.bodyActor.body.position.y * (1 - k);

    this.cameraGroup.position.z =
      this.cameraGroup.position.z * k +
      this.bodyActor.body.position.z * (1 - k);*/

    this.handleMessages(this.messages);
    while (this.messages.pop()) {}
  }
  addMessage(message) {
    this.messages.push(message);
  }

  applyImpulseRelativeToCamera(speed) {
    const THREE = this.THREE;
    const CANNON = this.CANNON;
    let direction = new THREE.Vector3();

    direction.set(0, 0, 1);
    direction.unproject(this.camera);
    var ray = new THREE.Ray(
      this.camera.position,
      direction.sub(this.camera.position).normalize()
    );
    direction.copy(ray.direction);
    const force = new CANNON.Vec3(
      direction.x * speed,
      direction.y * speed,
      direction.z * speed
    );
    const pointOnBody = new CANNON.Vec3(0, 0, 0);
    this.bodyActor.body.applyLocalImpulse(force, pointOnBody);
  }

  handleMessages(messages) {
    for (const message of messages) {
      if (message.forward) {
        this.applyImpulseRelativeToCamera(1);
      }
    }
  }

  get shouldBeDeleted() {
    return false;
  }
}
