export class Mouse {
  constructor(THREE) {
    this.THREE = THREE;
    this.mousePressed = false;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    document.addEventListener(
      "mousemove",
      function onDocumentMouseMove(event) {
        if (this.mousePressed) {
          this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          console.log(this.mouse.x, this.mouse.y);
        }
      }.bind(this),
      false
    );
    document.addEventListener(
      "mousedown",
      function onDocumentMouseDown(event) {
        this.mousePressed = true;
      }.bind(this),
      false
    );
    document.addEventListener(
      "mouseup",
      function onDocumentMouseUp(event) {
        this.mousePressed = false;
      }.bind(this),
      false
    );
  }
}
