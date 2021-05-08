import Nebula, {
  SpriteRenderer,
  Alpha,
  Scale,
  Color,
  Emitter
} from "three-nebula";
import update from "immutability-helper";

import left_hand_ps from "./particles/left_hand.json";
import right_hand_ps from "./particles/right_hand.json";
import fireball_ps from "./particles/fireball.json";

let particles_json_map = {
  left_hand: left_hand_ps,
  right_hand: right_hand_ps,
  fireball: fireball_ps
};

export class ParticleSystem {
  constructor(options) {
    this.THREE = options.THREE;
    this.scene = options.scene;
    this.type = options.type;

    Nebula.fromJSONAsync(this.getParticleJSON(options), this.THREE).then(
      (system) => {
        this.renderer = new SpriteRenderer(this.scene, this.THREE);
        this.nebula = system.addRenderer(this.renderer);
      }
    );
  }

  getParticleJSON(options) {
    const base = particles_json_map[options.type];
    const data = update(base, {
      emitters: [
        {
          behaviours: [
            {},
            {},
            { properties: { $set: { colorA: "#ffffff", colorB: "#ffffff" } } }
          ]
        }
      ]
    });
    console.log(data);
    return data;
  }

  update(dt) {
    if (this.nebula) {
      this.nebula.update();
    }
  }

  stop() {
    this.nebula.emitters.forEach((emitter) => {
      emitter.rate.numPan.a = 0;
      emitter.rate.numPan.b = 0;
    });
  }

  get hasParticles() {
    for (const emitter of this.nebula.emitters) {
      if (emitter.particles.length > 0) {
        return true;
      }
    }
    return false;
  }

  delete() {
    this.nebula.emitters.forEach((emitter) => {
      emitter.removeAllParticles();
      emitter.dead = true;
    });
    this.nebula.update();
    this.nebula.destroy();
    delete this.nebula;
  }

  setPosition(position) {
    if (this.nebula) {
      this.nebula.emitters[0].setPosition(position);
    }
  }
}
