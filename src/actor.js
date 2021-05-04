import { Entity } from "./entity.js";

export class Actor extends Entity {
  constructor(options) {
    super(options);

    this.lifeSpan = options.lifeSpan;
    this.particleSystems = [];
    this.lights = [];
    this.initShape(options);

    if (options.velocity) {
      const velocity = options.velocity;
      this.body.angularVelocity.set(velocity.x, velocity.y, velocity.z);
    } else {
      this.body.angularVelocity.set(0, 0, 0);
    }
    this.body.linearDamping = 0.05;
    this.body.angularDamping = 0.5;

    if (options.position) {
      this.body.position.copy(options.position);
      console.log(this.body.position);
    } else {
      this.body.position.set(
        Math.random() * 4 - 2,
        Math.random() * 4,
        Math.random() * 4 - 2
      );
    }

    this.map.addActor(this);
  }

  initShape(options) {
    const THREE = this.THREE;
    const CANNON = this.CANNON;
    let geometry;
    switch (options.shapeType) {
      case "box":
        geometry = new THREE.BoxGeometry(0.3, 0.2, 0.6);
        this.shape = new CANNON.Box(new CANNON.Vec3(0.15, 0.1, 0.3));
        break;
      case "sphere":
      default:
        geometry = new THREE.IcosahedronGeometry(0.2, 3);
        this.shape = new CANNON.Sphere(0.2);
        break;
    }

    this.mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
    );
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.body = new CANNON.Body({
      ...options.bodySettings,
      mass: options.mass ?? 1
    });
    this.body.addShape(this.shape);
  }

  update(dt) {
    if (this.lifeSpan !== undefined) {
      this.lifeSpan -= dt;
    }

    if (this.shouldBeKilled) {
      this.kill();
    }

    const mesh = this.mesh;

    // Copy coordinates from Cannon.js to Three.js
    this.mesh.position.copy(this.body.position);
    //console.log(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
    //console.log(this.body.position);

    this.particleSystems.forEach((particleSystem) => {
      particleSystem.setPosition(this.mesh.position);
      particleSystem.update();
    });
  }

  kill() {
    console.log("kill!");
    // remove physics
    this.world.remove(this.body);
    this.scene.remove(this.mesh);

    // remove lights
    this.lights.forEach((light) => {
      this.scene.remove(light);
    });
    this.lights = [];

    // stop any new particles
    // we'll wait for them to fade before we delete
    this.particleSystems.forEach((particleSystem) => {
      particleSystem.stop();
    });
  }

  delete() {
    console.log("Delete!");
    // remove particles
    this.particleSystems.forEach((particleSystem) => {
      particleSystem.delete();
    });
    this.particleSystems = [];
  }

  get shouldBeKilled() {
    return this.lifeSpan < 0;
  }

  get shouldBeDeleted() {
    if (!this.shouldBeKilled) {
      return false;
    }
    for (const particleSystem of this.particleSystems) {
      if (particleSystem.hasParticles) {
        return false;
      }
    }

    return true;
  }
}
