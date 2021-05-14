import { Entity } from "./entity.js";
import { Actor } from "./actor.js";
import * as YUKA from "yuka";
let once = 1;
function sync(vehicle, actor) {
  actor.body.velocity.copy(vehicle.velocity);
  //if (once == 0) return;
  //console.log(vehicle);
  //once = 0;
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
      lifespan: undefined,
      velocity: undefined,
      mass: 1,
      bodySettings: { fixedRotation: true, material: "playerMaterial" }
    });
    const params = {
      alignment: 1,
      cohesion: 0.9,
      separation: 0.3
    };
    alignmentBehavior.weight = params.alignment;
    cohesionBehavior.weight = params.cohesion;
    separationBehavior.weight = params.separation;

    const vehicle = new YUKA.Vehicle();
    vehicle.maxSpeed = 1.5;
    vehicle.updateNeighborhood = true;
    vehicle.neighborhoodRadius = 10;

    vehicle.setRenderComponent(this.actor, sync);

    vehicle.steering.add(alignmentBehavior);
    vehicle.steering.add(cohesionBehavior);
    vehicle.steering.add(separationBehavior);

    const wanderBehavior = new YUKA.WanderBehavior();
    wanderBehavior.weight = 0.5;
    vehicle.steering.add(wanderBehavior);

    this.map.aiManager.add(vehicle);
  }
}
