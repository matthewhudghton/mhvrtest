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
import gun1_ps from "./particles/gun1.json";

let particles_json_map = {
  left_hand: left_hand_ps,
  right_hand: right_hand_ps,
  fireball: fireball_ps,
  gun1: gun1_ps
};

export class ParticleSystem {
  constructor(options) {
    this.THREE = options.THREE;
    this.scene = options.scene;
    this.type = options.type;
    this.useLoaded = options.useLoaded ?? false;

    Nebula.fromJSONAsync(this.getParticleJSON(options), this.THREE).then(
      (system) => {
        this.renderer = new SpriteRenderer(this.scene, this.THREE);
        this.nebula = system.addRenderer(this.renderer);
      }
    );
  }

  getParticleJSON(options) {
    const base = particles_json_map[options.type];
    /* If options.useDefault is setto true, then don't override settings */
    if (options.useLoaded) {
      return base;
    }
    const data = update(base, {
      emitters: [
        {
          behaviours: { $set: this.getBehaviours(options) }
        }
      ]
    });

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
    if (
      this.nebula &&
      this.nebula.emitters &&
      this.nebula.emitters.length > 0
    ) {
      this.nebula.emitters[0].setPosition(position);
    }
  }

  getBehaviours(options) {
    let alphaA = options.alphaA ?? 1;
    let alphaB = options.alphaB ?? 0;
    let scaleA = options.scaleA ?? 1;
    let scaleB = options.scaleB ?? 1;
    let colorA = options.colorA ?? "#ff2a00";
    let colorB = options.colorB ?? "#111111";
    let fx = options.fx ?? 0.0;
    let fy = options.fy ?? 0.0;
    let fz = options.fz ?? 0.0;
    let rotateX = options.rotateX ?? 1;
    let rotateY = options.rotateY ?? 0;
    let rotateZ = options.rotateZ ?? 0;
    let driftX = options.driftX ?? 0.1;
    let driftY = options.driftY ?? 0.2;
    let driftZ = options.driftZ ?? 0.1;
    let driftDelay = options.driftDelay ?? 1;

    const behaviorJson = [
      {
        type: "Alpha",
        properties: {
          alphaA: alphaA,
          alphaB: alphaB,
          life: null,
          easing: "easeLinear"
        }
      },
      {
        type: "Scale",
        properties: {
          scaleA: scaleA,
          scaleB: scaleB,
          life: null,
          easing: "easeLinear"
        }
      },

      {
        type: "Color",
        properties: {
          colorA: colorA,
          colorB: colorB,
          life: null,
          easing: "easeOutCubic"
        }
      },
      {
        type: "Force",
        properties: {
          fx: fx,
          fy: fy,
          fz: fz,
          life: null,
          easing: "easeLinear"
        }
      },
      {
        type: "Rotate",
        properties: {
          x: rotateX,
          y: rotateY,
          z: rotateZ,
          life: null,
          easing: "easeLinear"
        }
      },
      {
        type: "RandomDrift",
        properties: {
          driftX: driftX,
          driftY: driftY,
          driftZ: driftZ,
          delay: driftDelay,
          life: null,
          easing: "easeLinear"
        }
      }
    ];
    return behaviorJson;
  }
}
