import * as THREE from "three";
import * as CANNON from "cannon-es";
const soundsBasePath = "sounds/";
const soundFileMapping = {
  woosh01: "woosh01.ogg",
  explosion01: "explosion01.ogg",
  music01: "Acruta Lao Dnor.mp3",
  cast01: "cast01.ogg",
  portal01: "portal01.ogg"
};

function getSoundFile(name) {
  return soundsBasePath + soundFileMapping[name];
}

export class Sound {
  THREE;
  constructor(options) {
    this.actor = options.actor;
    this.player = options.player;
    this.volume = options.volume ?? 0.1;
    this.name = options.name ?? "woosh01";
    this.soundLoaded = false;
    this.loop = options.loop ?? true;
    this.duration = options.duration ?? undefined;
    this.detune = options.detune;
    if (!isFinite(this.detune)) {
      this.detune = 0;
    }
    this.sound = new THREE.PositionalAudio(this.player.listener);
    const sound = this.sound;
    const actor = this.actor;
    const volume = this.volume;
    const name = this.name;
    const loop = this.loop;
    const self = this;
    const duration = this.duration;
    const detune = this.detune;
    this.mesh = options.mesh;
    this.audioLoader = new THREE.AudioLoader();
    this.audioLoader.load(getSoundFile(name), function (buffer) {
      sound.detune = detune;
      sound.setBuffer(buffer);
      sound.setRefDistance(20);
      actor.mesh.add(sound);
      sound.setLoop(loop);
      sound.setVolume(volume);
      sound.duration = duration;
      sound.play();
      self.soundLoaded = true;
    });
  }

  kill() {
    if (this.soundLoaded) {
      if (this.loop) {
        this.sound.stop();
      }
    }
  }
}
