import * as THREE from "three";
import * as CANNON from "cannon-es";
import { ChargeBar } from "./chargeBar.js";
import { Entity } from "./entity.js";
import GLTFLoader from "three-gltf-loader";

export class Actor extends Entity {
  constructor(options) {
    super(options);

    this.lifeSpan = options.lifeSpan;
    this.attachedTo = options.attachedTo ?? undefined;
    this.attachedToOffset =
      options.attachedToOffset ?? new THREE.Vector3(0, 0, 0);
    this.particleSystems = [];
    this.debouncers = [];
    this.lights = [];
    this.sounds = [];
    this.rawShapeData = options.rawShapeData ?? {
      width: 0.15,
      height: 0.15,
      size: 0.1
    };

    this.applyGravity = options.applyGravity ?? true;
    this.noDie = options.noDie ?? false;
    this.size = this.rawShapeData.size / 2 ?? this.rawShapeData.width;
    this.width = this.rawShapeData.width;
    this.height = this.rawShapeData.height;
    this.depth = this.rawShapeData.depth ?? 0.5;
    this.color = options.color ?? new THREE.Color(1, 1, 1);
    this.invisible = options.invisible ?? false;
    this.ai = options.ai;

    this.maxHealth = options.maxHealth ?? -1;
    this.health = options.health ?? options.maxHealth ?? -1;

    options.bodySettings ??= {};
    this.canTravelPortal = options.canTravelPortal ?? true;
    options.bodySettings.linearDamping ??= 0.05;
    options.bodySettings.angularDamping ??= 0.5;
    options.density ??= 1;
    options.bodySettings.mass ??= this.size * 5 * options.density;
    this.spritePath = options.spritePath;

    this.maxSpriteOpacity = options.maxSpriteOpacity ?? 1;

    this.chargeBars = [];

    this.initShape(options);
    this.initHealth(options);
    this.initModel(options);

    if (options.velocity) {
      this.body.velocity.copy(options.velocity);
    } else {
      this.body.angularVelocity.set(0, 0, 0);
    }

    if (options.position) {
      this.body.position.copy(options.position);
    } else {
      this.body.position.set(
        Math.random() * 4 - 2,
        Math.random() * 4,
        Math.random() * 4 - 2
      );
    }

    this.map.addActor(this, options.ghost);

    if (this.collideEvent) {
      this.body.addEventListener("collide", this.collideEvent);
    }
    this.spriteWidth = options.spriteWidth ?? this.size;
    this.spriteHeight = options.spriteHeight ?? this.size;
    if (this.spritePath !== undefined) {
      const map = new THREE.TextureLoader().load(this.spritePath);
      const material = new THREE.SpriteMaterial({
        map: map,
        color: this.color
      });
      this.sprite = new THREE.Sprite(material);
      this.sprite.scale.set(this.spriteWidth, this.spriteHeight, 1);
      this.sprite.material.opacity = this.maxSpriteOpacity;
      this.mesh.add(this.sprite);
    }

    this.body.userData = { actor: this };
  }

  initHealth(options) {
    if (this.maxHealth > 0) {
      this.healthBar = new ChargeBar({
        maxCharge: this.maxHealth,
        currentCharge: this.health,
        width: 1,
        height: 0.1,
        offsetY: this.body.aabb.upperBound.y,
        opacity: 1,
        backgroundColor: new THREE.Color(0.2, 0.1, 0.2),
        foregroundColor: new THREE.Color(0.05, 0.95, 0.05)
      });
      this.addChargeBar(this.healthBar);
    }
  }

  initModel(options, callback) {
    const modelPath = options.modelPath;
    if (!modelPath) {
      this.hideBasicMesh = false;
      return;
    }
    this.mesh.material.transparent = true;
    this.mesh.material.opacity = 0;
    this.hideBasicMesh = true;

    const loader = new GLTFLoader();

    loader.load(
      modelPath,
      (gltf) => {
        // called when the resource is loaded
        this.model = gltf.scene;
        this.mesh.add(gltf.scene);
      },
      (xhr) => {
        // called while loading is progressing
        console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        // called when loading has errors
        console.error("An error happened", error);
      }
    );
  }

  addChargeBar(chargeBar) {
    this.chargeBars.push(chargeBar);
    chargeBar.sprites.forEach((sprite) => {
      this.mesh.add(sprite);
    });
  }

  get collisionFilterGroup() {
    return this.body.collisionFilterGroup;
  }

  get collisionFilterMask() {
    return this.body.collisionFilterMask;
  }

  initShape(options) {
    let geometry;
    const invisible = this.invisible;

    switch (options.shapeType) {
      case "box":
        if (!invisible) {
          geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        }
        this.shape = new CANNON.Box(
          new CANNON.Vec3(this.width / 2, this.height / 2, this.depth / 2)
        );
        break;
      case "cone":
        geometry = new THREE.ConeBufferGeometry(this.width, this.height, 6);
        geometry.rotateX(Math.PI * 0.5);
        this.shape = new CANNON.Box(
          new CANNON.Vec3(this.width / 2, this.height / 2, this.width / 2)
        );
        break;
      case "sphere":
      default:
        if (!invisible) {
          geometry = new THREE.IcosahedronGeometry(this.size, 3);
        }

        this.shape = new CANNON.Sphere(this.size);
        break;
    }

    this.mesh = new THREE.Mesh(geometry, this.getMaterial());
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.body = new CANNON.Body({
      ...options.bodySettings,
      mass: options.mass ?? this.size,
      collisionFilterGroup: options.collisionFilterGroup ?? 1,
      collisionFilterMask: options.collisionFilterMask ?? 0xffff
    });

    this.body.addShape(this.shape);
  }

  getMaterial() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load("textures/texture.jpeg");
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.encoding = THREE.sRGBEncoding;
    return new THREE.MeshLambertMaterial({
      map: texture,
      color: this.color,
      transparent: true,
      opacity: 0.0
    });
  }

  update(dt) {
    if (this.lifeSpan !== undefined) {
      this.lifeSpan -= dt;
    }

    if (this.newPosition) {
      this.body.position.copy(this.newPosition);
      this.newPosition = undefined;
    }

    if (!this.applyGravity) {
      this.body.applyForce(
        new CANNON.Vec3(0, -this.map.gravity * this.body.mass, 0)
      );
    }

    if (this.mesh.material.opacity < 1 && !this.hideBasicMesh) {
      this.mesh.material.opacity += 0.01;
    }

    if (this.attachedTo) {
      let rotatedOffset = new THREE.Vector3()
        .copy(this.attachedToOffset)
        .applyQuaternion(this.attachedTo.quaternion);
      this.attachedTo.getWorldPosition(this.mesh.position);
      this.mesh.position.add(rotatedOffset);

      this.attachedTo.getWorldQuaternion(this.mesh.quaternion);
      this.body.position.copy(this.mesh.position);
      this.body.quaternion.copy(this.mesh.quaternion);
    } else {
      this.mesh.position.copy(this.body.position);
      this.mesh.quaternion.copy(this.body.quaternion);
    }

    if (this.shouldBeKilled) {
      this.kill();
    }

    // Copy coordinates from Cannon.js to Three.js
    this.particleSystems.forEach((particleSystem) => {
      particleSystem.setPosition(this.mesh.position);
      particleSystem.update(dt);
    });

    this.debouncers.forEach((debouncer) => {
      debouncer.update(dt);
    });

    this.chargeBars.forEach((chargeBar) => {
      chargeBar.update(dt);
    });
  }

  forceKill() {
    this.lifeSpan = 0;

    if (this.ai) {
      this.ai.kill();
    }
    // remove physics
    this.world.removeBody(this.body);
    this.scene.remove(this.mesh);

    // remove lights
    this.lights.forEach((light) => {
      this.scene.remove(light);
    });
    this.lights = [];

    // stop any new particles
    // we'll wait for them to fade before we delete
    this.stopParticleSystems();

    // stop any sounds being played
    this.sounds.forEach((sound) => {
      sound.kill();
    });
    this.sounds = [];
  }

  stopParticleSystems() {
    this.particleSystems.forEach((particleSystem) => {
      particleSystem.stop();
    });
  }

  kill() {
    if (this.noDie) {
      return;
    }
    this.forceKill();
  }

  delete() {
    // remove particles
    this.particleSystems.forEach((particleSystem) => {
      particleSystem.delete();
    });
    this.particleSystems = [];
  }

  doDamage(amount) {
    if (this.healthBar) {
      this.healthBar.tryFireAndForceUseCharge(amount);
    }
  }

  get shouldBeKilled() {
    return (
      !this.noDie &&
      ((this.healthBar && this.healthBar.current <= 0) || this.lifeSpan <= 0)
    );
  }

  get shouldBeDeleted() {
    if (!this.shouldBeKilled) {
      return false;
    }
    for (const particleSystem of this.particleSystems) {
      if (particleSystem.hasParticles) {
        return false;
      }
    }

    return true;
  }
}
