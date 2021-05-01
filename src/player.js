import { Vector3 } from "three";
import { Actor } from "./actor.js";
import { Debouncer } from "./debouncer.js";
import { Entity } from "./entity.js";
import { ParticleSystem } from "./particleSystem.js";

export class Player extends Entity {
  leftHandPosition = new Vector3(0, 0, 0);
  rightHandPosition = new Vector3(0, 0, 0);
  THREE;
  CANNON;
  cameraGroup;
  map;
  messages;
  //THREE, CANNON, camera, cameraGroup, map
  constructor(options) {
    super(options);
    this.cameraGroup = options.cameraGroup;
    this.camera = options.camera;

    let position = new this.CANNON.Vec3(0, 1, 0);
    this.bodyActor = new Actor({
      THREE: this.THREE,
      CANNON: this.CANNON,
      map: this.map,
      lifespan: undefined,
      position,
      velocity: undefined,
      bodySettings: { fixedRotation: true, material: "playerMaterial" }
    });
    this.bodyActor.body.fixedRotation = true;
    this.bodyActor.body.linearDamping = 0.4;

    this.leftFireDebouncer = new Debouncer(1);
    this.rightFireDebouncer = new Debouncer(1);
    this.debouncers = [this.leftFireDebouncer, this.rightFireDebouncer];
    this.playerPos = undefined;
    this.messages = [];

    this.leftHandParticleSystem = new ParticleSystem({
      THREE: this.THREE,
      scene: this.map.scene,
      type: "left_hand"
    });

    this.rightHandParticleSystem = new ParticleSystem({
      THREE: this.THREE,
      scene: this.map.scene,
      type: "right_hand"
    });
  }

  update(dt) {
    const CANNON = this.CANNON;
    const k = 0.05;

    this.leftHandParticleSystem.update(dt);
    this.rightHandParticleSystem.update(dt);
    /*
    this.leftHandParticleSystem.setPosition(
      this.leftHandPosition.x,
      this.leftHandPosition.y,
      this.leftHandPosition.z
    );

    this.rightHandParticleSystem.setPosition(
      this.rightHandPosition.x,
      this.rightHandPosition.y,
      this.rightHandPosition.z
    );*/

    this.debouncers.forEach((debouncer) => {
      debouncer.update(dt);
    });

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
      if (message.fire && this.rightFireDebouncer.tryFireAndReset()) {
        /* Fire */

        new Actor({
          THREE: this.THREE,
          CANNON: this.CANNON,
          map: this.map,
          lifeSpan: undefined,
          position: message.fire.position
        });
      }
    }
  }

  get shouldBeDeleted() {
    return false;
  }
}
