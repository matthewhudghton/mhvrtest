import Nebula, { SpriteRenderer, Alpha, Scale, Color } from "three-nebula";

import left_hand_ps from "./particles/left_hand.json";
import right_hand_ps from "./particles/right_hand.json";

let particles_json_map = {
  left_hand: left_hand_ps,
  right_hand: right_hand_ps
};

export class ParticleSystem {
  constructor(options) {
    this.THREE = options.THREE;
    this.scene = options.scene;
    this.type = options.type;

    Nebula.fromJSONAsync(particles_json_map[options.type], this.THREE).then(
      (system) => {
        const nebulaRenderer = new SpriteRenderer(this.scene, this.THREE);
        this.nebula = system.addRenderer(nebulaRenderer);
      }
    );
  }

  update(dt) {
    if (this.nebula) {
      this.nebula.update();
    }
  }

  setPosition(x, y, z) {
    if (this.nebula) {
      this.nebula.emitters[0].position.x = x;
      this.nebula.emitters[0].position.y = y;
      this.nebula.emitters[0].position.z = z;
    }
  }
}
