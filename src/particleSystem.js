import Nebula, { SpriteRenderer } from "three-nebula";
import hand_system from "./my-particle-system.json";

export class ParticleSystem {
  constructor(options) {
    this.THREE = options.THREE;
    this.scene = options.scene;

    Nebula.fromJSONAsync(hand_system, this.THREE).then((system) => {
      const nebulaRenderer = new SpriteRenderer(this.scene, this.THREE);
      this.nebula = system.addRenderer(nebulaRenderer);
      this.nebula.emitters[0].position.z = -10;
      this.nebula.emitters[0].position.x = 10;
      this.nebula.emitters[0].position.y = 5;
    });
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
