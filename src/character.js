import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Actor } from "./actor.js";
import { Explosion } from "./explosion.js";
import { ParticleSystem } from "./particleSystem.js";
import { Sound } from "./sound.js";

class LinkedBox {
  constructor(options) {
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(options.width, options.height, options.depth),
      new THREE.MeshPhongMaterial()
    );
    this.mesh.position.copy(options.position);
    options.scene.add(this.mesh);
  }
}

export class Character extends Actor {
  constructor(options) {
    super(options);

    this.shapes = [];

    const boxInit = {
      head: { x: 0, y: 3, z: 0 },
      chest: { x: 0, y: 2, z: 0 },
      lUarm: { x: -1.2, y: 2, z: 0 },
      lArm: { x: -1.4, y: 1, z: 0 },
      lHand: { x: -1.4, y: 0, z: 0 },
      rUarm: { x: 1.2, y: 2, z: 0 },
      rArm: { x: 1.4, y: 1, z: 0 },
      rHand: { x: 1.4, y: 0, z: 0 },
      body: { x: 0, y: 0.5, z: 0 },
      hip: { x: 0, y: -1, z: 0 },
      lThigh: { x: -1, y: -1.2, z: 0 },
      lKnee: { x: -1, y: -2.4, z: 0 },
      lFoot: { x: -1, y: -3.6, z: 0 },
      rThigh: { x: 1, y: -1.2, z: 0 },
      rKnee: { x: 1, y: -2.4, z: 0 },
      rFoot: { x: 1, y: -3.6, z: 0 }
    };

    for (const key in boxInit) {
      const base = options.position;
      const child = boxInit[key];

      this.shapes.push(
        new LinkedBox({
          position: new CANNON.Vec3(
            base.x + child.x / 3,
            base.y + child.y / 3,
            base.z + child.z / 3
          ),
          width: 0.2,
          height: 0.2,
          depth: 0.2,
          scene: this.scene
        })
      );
    }
    //let normalMap = new THREE.TextureLoader().load("bumpmaps/noise.jpg");
  }

  addBox(width, height, depth) {}

  kill() {
    Actor.prototype.kill.call(this);
  }

  update(dt) {
    Actor.prototype.update.call(this, dt);
  }

  collideEvent(event) {}
}
