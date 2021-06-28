import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Actor } from "./actor.js";
import { ParticleSystem } from "./particleSystem.js";
import { Sound } from "./sound.js";

export class Explosion extends Actor {
  constructor(options) {
    options.shapeType ??= "sphere";
    options.bodySettings ??= {};
    options.bodySettings.fixedRotation = true;
    options.bodySettings.collisionResponse = 0;
    options.lifeSpan ??= 0.5;
    options.invisible ??= false;
    options.ghost ??= false;
    options.applyGravity ??= false;
    const size = options.rawShapeData.size;
    options.rawShapeData.size *= 4;
    const blue = Math.min(-100 + size * 80, 255);
    const red = Math.max(Math.min(100 + size * 5, 255) - blue, 0);
    const green = 80 + size * 5 - blue;

    options.color ??= new THREE.Color(red / 255, green / 255, blue / 255);

    super(options);
    this.speed = options.speed ?? 15;
    this.body.linearDamping = 0;
    this.particleSystems.push(
      new ParticleSystem({
        scene: this.scene,
        type: "fireball",
        colorA: "#" + this.color.getHexString(),
        scaleA: size * 2,
        scaleB: size,
        position: this.body.position,
        radialVelocityY: 1 + 10,
        radialVelocityRadius: 14,
        particlesMax: 1,
        useLoaded: false,
        particlesMin: 1
      })
    );

    if (true || Math.random() * 15 < this.size) {
      const light = new THREE.PointLight(
        this.color,
        this.size * this.size * 5,
        0,
        2
      );
      //light.position.set(0, 0, 0);
      //this.lights.push(light);
      //this.mesh.add(light);
    }
    this.sounds.push(
      new Sound({
        actor: this,
        player: this.map.player,
        name: "explosion01",
        loop: false,
        detune: (1 - this.size) * 1200
      })
    );
  }

  update(dt) {
    Actor.prototype.update.call(this, dt);
  }

  collideEvent(event) {
    let me = event.target.userData;
    let them = event.body.userData;
    let direction = new CANNON.Vec3(0, 0, 0);
    event.body.position.vsub(event.target.position, direction);
    direction.normalize();
    event.body.applyForce(
      direction.scale(
        Math.max(
          10000 - event.body.position.distanceTo(event.target.position),
          0
        )
      )
    );
  }
}
