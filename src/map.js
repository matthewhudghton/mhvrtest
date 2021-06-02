import { Actor } from "./actor";
import { Block } from "./block";
import * as YUKA from "yuka";

export class Map {
  constructor(options) {
    this.THREE = options.THREE;
    this.CANNON = options.CANNON;
    this.scene = options.scene;
    this.world = options.world;
    const THREE = this.THREE;
    const scene = this.scene;
    const world = this.world;
    const CANNON = this.CANNON;

    this.actors = [];
    this.aiManager = new YUKA.EntityManager();
    this.obstacles = [];
    this.ais = [];

    let floorGeometry = new THREE.PlaneGeometry(300, 300, 50, 50);
    floorGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    let material = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });

    const loader = new THREE.TextureLoader();
    const groundTexture = loader.load("textures/grasslight-big.jpg");
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(25, 25);
    groundTexture.anisotropy = 16;
    groundTexture.encoding = THREE.sRGBEncoding;

    const groundMaterial = new THREE.MeshLambertMaterial({
      map: groundTexture
    });

    const floorMesh = new THREE.Mesh(floorGeometry, groundMaterial);
    floorMesh.castShadow = true;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // add a floor
    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({
      mass: 0,
      collisionFilterGroup: 1,
      collisionFilterMask: 0xffff,
      position: new CANNON.Vec3(-5, 0, 0)
    });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2
    );
    floorMesh.position.copy(groundBody.position);
    world.addBody(groundBody);

    for (var i = 0; i < 15; i++) {
      const width = 10 + Math.random() * 150;
      const height = 10 + Math.random() * 150;
      const depth = 10 + Math.random() * 150;
      let x = Math.random() * 500 - 250;
      let y = height / 2;
      let z = Math.random() * 500 - 250;
      if (x < width) {
        x -= width;
      }
      if (x > width) {
        x += width;
      }

      new Block({
        THREE: this.THREE,
        CANNON: this.CANNON,
        map: this,
        shapeType: "box",
        lifespan: undefined,
        velocity: undefined,
        position: new CANNON.Vec3(x, y, z),
        applyGravity: false,
        color: new THREE.Color(Math.random(), Math.random(), Math.random()),
        rawShapeData: {
          size: 1,
          width: width,
          height: height,
          depth: depth
        },
        bodySettings: { material: "playerMaterial", angularDamping: 0 },
        mass: 0
      });
    }
  }

  addActor(actor, ghost) {
    if (!ghost) {
      this.scene.add(actor.mesh);
      this.world.addBody(actor.body);
    }
    this.actors.push(actor);
  }

  update(dt) {
    // guard against bug in cannon where 0 time cause error
    if (dt <= 0) {
      return;
    }

    this.world.step(dt);
    this.aiManager.update(dt);
    this.ais.forEach((ai) => {
      ai.update(dt);
    });
    /* Delete any actor marked as should remove */
    const actors = this.actors;
    let i = actors.length;
    while (i--) {
      const actor = actors[i];
      // Step the physics world
      actor.update(dt);

      if (actor.shouldBeDeleted) {
        actor.delete();
        actors.splice(i, 1);
      }
    }
  }
}
