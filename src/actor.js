export class Actor {
  constructor(THREE, scene, lifeSpan = 1000) {
    this.THREE = THREE;
    this.scene = scene;
    this.lifeSpan = lifeSpan;
    const geometry = new THREE.IcosahedronGeometry(0.1, 3);
    this.object = new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
    );

    this.object.position.x = Math.random() * 4 - 2;
    this.object.position.y = Math.random() * 4;
    this.object.position.z = Math.random() * 4 - 2;

    this.object.userData.velocity = new THREE.Vector3();
    this.object.userData.velocity.x = Math.random() * 0.01 - 0.005;
    this.object.userData.velocity.y = Math.random() * 0.01 - 0.005;
    this.object.userData.velocity.z = Math.random() * 0.01 - 0.005;

    scene.add(this.object);
  }

  update(dt) {
    this.lifeSpan -= 1;
    const object = this.object;
    this.object.position.x += object.userData.velocity.x * dt;
    this.object.position.y += object.userData.velocity.y * dt;
    this.object.position.z += object.userData.velocity.z * dt;
  }

  delete() {
    this.scene.remove(this.object);
  }

  get shouldBeDeleted() {
    return this.lifeSpan < 0;
  }
}
