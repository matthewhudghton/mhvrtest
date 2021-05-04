import Nebula, { SpriteRenderer, Alpha, Scale, Color } from "three-nebula";

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

    Nebula.fromJSONAsync(particles_json_map[options.type], this.THREE).then(
      (system) => {
        this.renderer = new SpriteRenderer(this.scene, this.THREE);
        this.nebula = system.addRenderer(this.renderer);
      }
    );
  }

  update(dt) {
    if (this.nebula) {
      this.nebula.update();
    }
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
