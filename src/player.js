import { Actor } from "./actor";

export class Player {
  constructor(THREE, CANNON, camera, cameraGroup, map) {
    this.THREE = THREE;
    this.CANNON = CANNON;
    this.cameraGroup = cameraGroup;
    this.camera = camera;
    let position = new CANNON.Vec3(0, 1, 0);
    this.bodyActor = new Actor(
      THREE,
      CANNON,
      map,
      undefined,
      position,
      undefined,
      { fixedRotation: true, material: "playerMaterial" }
    );
    this.bodyActor.body.fixedRotation = true;
    this.bodyActor.body.linearDamping = 0.4;

    this.playerPos = undefined;
    this.messages = [];
    this.map = map;
  }

  update(dt) {
    const CANNON = this.CANNON;
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

    /* this.bodyActor.body.quaternion.setFromAxisAngle(
      new CANNON.Vec3(0, 0, 0),
      -Math.PI / 2
    );*/

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
    this.bodyActor.body.applyImpulse(force, pointOnBody);
  }

  handleMessages(messages) {
    for (const message of messages) {
      /* Movement */
      if (message.forward) {
        this.applyImpulseRelativeToCamera(2);
      }
      if (message.backward) {
        this.applyImpulseRelativeToCamera(-2);
      }
      if (message.fire) {
        /* Fire */

        new Actor(
          this.THREE,
          this.CANNON,
          this.map,
          undefined,
          message.fire.position,
          undefined
        );
      }
    }
  }

  get shouldBeDeleted() {
    return false;
  }
}
