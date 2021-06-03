import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Actor } from "./actor.js";
import { Explosion } from "./explosion.js";
import { ParticleSystem } from "./particleSystem.js";
import { Sound } from "./sound.js";

export class Projectile extends Actor {
  constructor(options) {
    options.shapeType ??= "sphere";
    options.bodySettings ??= {};
    options.bodySettings.fixedRotation = true;
    options.lifeSpan ??= 8;
    options.invisible ??= true;
    options.applyGravity ??= false;

    const size = options.rawShapeData.size;

    const blue = Math.min(-100 + size * 80, 255);
    const red = Math.max(Math.min(100 + size * 5, 255) - blue, 0);
    const green = 80 + size * 5 - blue;

    options.color ??= new THREE.Color(red / 255, green / 255, blue / 255);

    super(options);

    this.exploding = false;
    this.hasExploded = false;
    this.speed = options.speed ?? 15;
    if (options.reverseProjectile) {
      this.speed = -this.speed;
    }

    this.body.linearDamping = 0;
    this.particleSystems.push(
      new ParticleSystem({
        scene: this.scene,
        type: "fireball",
        colorA: "#" + this.color.getHexString(),
        scaleA: size * 0.5,
        scaleB: size,
        position: this.body.position
      })
    );

    if (true || Math.random() * 15 < this.size) {
      const light = new THREE.PointLight(
        this.color,
        this.size * this.size,
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
        detune: (5 - this.size) * 1000,
        duration: 20
      })
    );
  }

  kill() {
    Actor.prototype.kill.call(this);
  }

  update(dt) {
    Actor.prototype.update.call(this, dt);

    this.body.applyLocalImpulse(
      new CANNON.Vec3(0, 0, this.speed * dt),
      new CANNON.Vec3(0, 0, 0)
    );

    if (this.lifeSpan < 1) {
      this.exploding = true;
    }
    if (this.exploding && !this.hasExploded) {
      new Explosion({
        map: this.map,
        lifeSpan: undefined,
        rawShapeData: this.rawShapeData,
        position: this.body.position,
        bodySettings: {
          quaternion: this.body.quaternion
        },
        collisionFilterGroup: this.collisionFilterGroup,
        collisionFilterMask: this.collisionFilterMask
      });

      this.hasExploded = true;
      this.lifeSpan = 0;
    }
  }

  explode() {
    this.exploding = true;
  }

  collideEvent(event) {
    event.target.userData.actor.explode();
    if (event.body?.userData?.actor) {
      event.body.userData.actor.lifeSpan = 0;
    }
  }
}
