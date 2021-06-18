import * as THREE from "three";
import * as CANNON from "cannon-es";
const soundsBasePath = "sounds/";
const soundFileMapping = {
  woosh01: { path: "woosh01.ogg" },
  explosion01: { path: "explosion01.ogg" },
  music01: { path: "Acruta Lao Dnor.mp3" },
  cast01: { path: "cast01.ogg" },
  portal01: { path: "portal01.ogg" }
};

let SOUND_COUNT = 0;
function getSoundFile(name) {
  return soundsBasePath + soundFileMapping[name].path;
}

function getSoundFileCachedBuffer(name) {
  return soundFileMapping[name].buffer;
}

function cacheBufferForSoundFile(name, buffer) {
  return (soundFileMapping[name].buffer = buffer);
}

function playBufferedSound(options) {
  if (SOUND_COUNT > 40) {
    return;
  }
  const sound = options.sound;
  const actor = options.actor;
  const self = options.self;
  SOUND_COUNT++;
  sound.detune = options.detune;
  sound.setBuffer(options.buffer);
  sound.setRefDistance(20);
  actor.mesh.add(options.sound);
  sound.setLoop(options.loop);
  sound.setVolume(options.volume);
  sound.duration = options.duration;
  sound.play();
  self.soundLoaded = true;
  self.sound = sound;
  sound.onEnded(function () {
    options.self.forceKill();
  });
}

export class Sound {
  THREE;
  constructor(options) {
    options.name ??= "woosh01";
    options.volume ??= 0.1;
    options.loop ??= true;

    this.actor = options.actor;
    this.player = options.player;
    this.volume = options.volume;
    this.name = options.name;
    this.soundLoaded = false;
    this.loop = options.loop;
    this.duration = options.duration ?? undefined;
    if (!isFinite(options.detune)) {
      options.detune = 0;
    }
    this.detune = options.detune;

    options.sound = new THREE.PositionalAudio(this.player.listener);
    options.self = this;
    this.mesh = options.mesh;
    this.audioLoader = new THREE.AudioLoader();
    const possibleCachedBuffer = getSoundFileCachedBuffer(options.name);
    if (possibleCachedBuffer !== undefined) {
      options.buffer = possibleCachedBuffer;
      playBufferedSound(options);
    } else {
      this.audioLoader.load(getSoundFile(options.name), function (buffer) {
        options.buffer = buffer;
        cacheBufferForSoundFile(options.name, options.buffer);
        playBufferedSound(options);
      });
    }
  }

  kill() {
    if (this.soundLoaded) {
      this.sound.stop();
      this.forceKill();
    }
  }

  forceKill() {
    if (this.hasBeenKilled !== true) {
      this.soundLoaded = false;
      this.actor.mesh.remove(this.sound);

      SOUND_COUNT--;
      this.hasBeenKilled = true;
    }
  }
}
