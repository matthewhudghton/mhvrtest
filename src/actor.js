export class Actor {
  constructor(
    THREE,
    CANNON,
    map,
    lifeSpan = undefined,
    position = undefined,
    velocity = undefined
  ) {
    this.THREE = THREE;
    this.CANNON = CANNON;

    this.map = map;
    this.world = map.world;
    this.scene = map.scene;
    this.lifeSpan = lifeSpan;

    const geometry = new THREE.IcosahedronGeometry(0.2, 3);
    this.mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
    );

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.shape = new CANNON.Sphere(0.2);
    this.mass = 1;
    this.body = new CANNON.Body({
      mass: 1
    });
    this.body.addShape(this.shape);
    if (velocity) {
      this.body.angularVelocity.set(velocity.x, velocity.y, velocity.z);
    } else {
      this.body.angularVelocity.set(0, 0, 0);
    }
    this.body.linearDamping = 0.05;
    this.body.angularDamping = 0.5;
    console.log(position);
    if (position) {
      this.body.position.copy(position);
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

  update(dt) {
    if (this.lifeSpan !== undefined) {
      this.lifeSpan -= dt;
    }
    const mesh = this.mesh;

    // Copy coordinates from Cannon.js to Three.js
    this.mesh.position.copy(this.body.position);
    //console.log(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
    //console.log(this.body.position);
  }

  delete() {
    this.world.remove(this.body);
    this.scene.remove(this.mesh);
    console.log("deleteing!");
  }

  get shouldBeDeleted() {
    return this.lifeSpan < 0;
  }
}
