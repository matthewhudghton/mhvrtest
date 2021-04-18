import * as THREE from "three";

export class Hud {
  constructor(camera, scene, font) {
    this.camera = camera;
    this.font = font;
    this.scene = scene;
    this.objects = [];
  }

  // Getter
  get area() {
    return this.calcArea();
  }
  // Method
  calcArea() {
    return this.height * this.width;
  }
  render() {
    for (const object of this.objects) {
      object.position.x = this.camera.position.x + object.userData.offset.x;
      object.position.y = this.camera.position.y + object.userData.offset.y;
      object.position.z = this.camera.position.z + object.userData.offset.z;
    }
  }
  set debugText(value) {
    var textGeometry = new THREE.TextGeometry(value, {
      font: this.font,
      size: 0.1,
      height: 0.1
    });

    var textMaterial = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      specular: 0xffffff
    });

    for (var i = 0; i < 100; i++) {
      var mesh = new THREE.Mesh(textGeometry, textMaterial);
      mesh.position.x = 50 - i;
      mesh.position.y = 50 - i;
      mesh.position.z = 50 - i;
      mesh.userData.offset = new THREE.Vector3();
      mesh.userData.offset.x = 50 - i;
      mesh.userData.offset.y = 50 - i;
      mesh.userData.offset.z = 50 - i;
      mesh.material.depthTest = false;
      console.log("Adding text!!!");
      this.scene.add(mesh);
      this.objects.push(mesh);
    }
  }
}
