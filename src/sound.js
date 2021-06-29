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

function playBufferedSound(sound, options) {
  if (SOUND_COUNT > 40) {
    return;
  }

  SOUND_COUNT++;
  sound.detune = options.detune;
  options.self.buffer = options.buffer;
  sound.setBuffer(options.self.buffer);
  sound.setRefDistance(20);
  sound.setLoop(options.loop);
  sound.setVolume(options.volume);
  sound.duration = options.duration;
  sound.play();
  options.self.soundLoaded = true;

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
    options.mesh ??= options.actor.mesh;
    this.mesh = options.mesh;
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

    const sound = new THREE.PositionalAudio(this.player.listener);

    const mesh = options.mesh;
    this.sound = sound;

    options.self = this;

    this.audioLoader = new THREE.AudioLoader();
    const possibleCachedBuffer = getSoundFileCachedBuffer(options.name);
    if (possibleCachedBuffer !== undefined) {
      options.buffer = possibleCachedBuffer;
      playBufferedSound(sound, options);
    } else {
      this.audioLoader.load(getSoundFile(options.name), function (buffer) {
        options.buffer = buffer;
        cacheBufferForSoundFile(options.name, options.buffer);
        playBufferedSound(sound, options);
      });
    }
    options.mesh.add(sound);
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
      this.mesh.remove(this.sound);

      SOUND_COUNT--;
      this.hasBeenKilled = true;
    }
  }
}
