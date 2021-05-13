const soundsBasePath = "sounds/";
const soundFileMapping = {
  woosh01: "woosh01.ogg",
  music01: "Acruta Lao Dnor.mp3"
};

function getSoundFile(name) {
  return soundsBasePath + soundFileMapping[name];
}

export class Sound {
  THREE;
  constructor(options) {
    this.THREE = options.THREE;
    this.actor = options.actor;
    this.player = options.player;
    this.volume = options.volume ?? 0.3;
    this.name = options.name ?? "woosh01";
    this.soundLoaded = false;
    this.sound = new this.THREE.PositionalAudio(this.player.listener);
    const sound = this.sound;
    const actor = this.actor;
    const volume = this.volume;
    const name = this.name;
    const self = this;
    this.mesh = options.mesh;
    this.audioLoader = new this.THREE.AudioLoader();
    this.audioLoader.load(getSoundFile(name), function (buffer) {
      sound.setBuffer(buffer);
      sound.setRefDistance(20);
      actor.mesh.add(sound);
      sound.setLoop(true);
      sound.setVolume(volume);
      sound.play();
      self.soundLoaded = true;
    });
  }

  kill() {
    if (this.soundLoaded) {
      this.sound.stop();
    }
  }
}
