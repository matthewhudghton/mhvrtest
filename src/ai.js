import { Entity } from "./entity.js";
import { Actor } from "./actor.js";
import * as YUKA from "yuka";
let once = 1;
function sync(vehicle, actor) {
  actor.body.velocity.lerp(vehicle.velocity, 0.6, actor.body.velocity);
  vehicle.velocity.copy(actor.body.velocity);
  vehicle.position.copy(actor.body.position);
  actor.body.quaternion.copy(vehicle.rotation);
}

export class Ai extends Entity {
  constructor(options) {
    super(options);
    const THREE = this.THREE;
    const vehicleGeometry = new THREE.ConeBufferGeometry(0.1, 0.5, 8);
    vehicleGeometry.rotateX(Math.PI * 0.5);
    const vehicleMaterial = new THREE.MeshNormalMaterial();
    const alignmentBehavior = new YUKA.AlignmentBehavior();
    const cohesionBehavior = new YUKA.CohesionBehavior();
    const separationBehavior = new YUKA.SeparationBehavior();
    this.actor = new Actor({
      THREE: this.THREE,
      CANNON: this.CANNON,
      map: this.map,
      shapeType: "cone",
      ai: this,
      lifespan: undefined,
      velocity: undefined,
      mass: 1,
      bodySettings: { fixedRotation: true, material: "playerMaterial" }
    });
    this.actor.body.fixedRotation = true;
    const params = {
      alignment: 1,
      cohesion: 0.9,
      separation: 0.3
    };
    alignmentBehavior.weight = params.alignment;
    cohesionBehavior.weight = params.cohesion;
    separationBehavior.weight = params.separation;

    const vehicle = new YUKA.Vehicle();
    this.vehicle = vehicle;
    vehicle.maxSpeed = 1.5;
    vehicle.updateNeighborhood = true;
    vehicle.neighborhoodRadius = 10;

    vehicle.setRenderComponent(this.actor, sync);

    vehicle.steering.add(alignmentBehavior);
    vehicle.steering.add(cohesionBehavior);
    vehicle.steering.add(separationBehavior);
    const fleeBehavior = new YUKA.FleeBehavior(
      this.map.player.bodyActor.mesh.position
    );
    //vehicle.steering.add(fleeBehavior);
    /*const seekBehavior = new YUKA.SeekBehavior(
      this.map.player.bodyActor.mesh.position
    );
    vehicle.steering.add(seekBehavior);*/
    const pursuitBehavior = new YUKA.OffsetPursuitBehavior(
      this.map.player.vehicle,
      1
    );
    vehicle.steering.add(pursuitBehavior);

    const wanderBehavior = new YUKA.WanderBehavior();
    wanderBehavior.weight = 0.2;
    vehicle.steering.add(wanderBehavior);

    const obstacleAvoidanceBehavior = new YUKA.ObstacleAvoidanceBehavior(
      this.map.obstacles
    );
    vehicle.steering.add(obstacleAvoidanceBehavior);

    this.map.aiManager.add(vehicle);
    this.map.ais.push(this);
  }

  update(dt) {
    this.actor.body.applyImpulse(
      new this.CANNON.Vec3(0, 3.75 * dt, 0),
      this.actor.body.position
      //new this.CANNON.Vec3(0, 0, 0)
    );
  }

  kill() {
    this.map.aiManager.remove(this.vehicle);
  }
}
