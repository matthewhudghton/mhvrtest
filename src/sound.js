export class Sound {
  THREE;
  constructor(options) {
    this.THREE = options.THREE;
    this.actor = options.actor;
    this.player = options.player;
    //this.sound = new this.THREE.PositionalAudio(this.player.listener);
    this.mesh = options.mesh;
    /*this.audioLoader = new this.THREE.AudioLoader();
    this.audioLoader.load("sounds/woosh01.wav", function (buffer) {
      this.sound.setBuffer(buffer);
      this.sound.setRefDistance(20);
      this.actor.mesh.add(this.sound);
      this.sound.play();
    });*/
  }
}
