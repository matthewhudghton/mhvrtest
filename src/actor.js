export class Actor {
  constructor(THREE, CANNON, scene, world, lifeSpan = 1, position = undefined) {
    this.THREE = THREE;
    this.CANNON = CANNON;
    this.scene = scene;
    this.lifeSpan = lifeSpan;
    const geometry = new THREE.IcosahedronGeometry(0.2, 3);
    this.object = new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
    );

    this.object.castShadow = true;
    this.object.receiveShadow = true;
    scene.add(this.object);
    this.world = world;
    this.shape = new CANNON.Sphere(0.2);
    this.mass = 1;
    this.body = new CANNON.Body({
      mass: 1
    });
    this.body.addShape(this.shape);
    this.body.angularVelocity.set(0, 0, 0);
    this.body.linearDamping = 0.05;
    this.body.angularDamping = 0.5;

    if (position) {
      this.body.position = position;
    } else {
      this.body.position.set(
        Math.random() * 4 - 2,
        Math.random() * 4,
        Math.random() * 4 - 2
      );
    }

    this.world.addBody(this.body);
  }

  update(dt) {
    this.lifeSpan -= dt;
    const object = this.object;

    // Copy coordinates from Cannon.js to Three.js
    this.object.position.copy(this.body.position);
    //console.log(this.body.position);
    this.object.quaternion.copy(this.body.quaternion);
    //console.log(this.body.position);
  }

  delete() {
    this.world.remove(this.body);
    this.scene.remove(this.object);
    console.log("deleteing!");
  }

  get shouldBeDeleted() {
    return this.lifeSpan < 0;
  }
}
