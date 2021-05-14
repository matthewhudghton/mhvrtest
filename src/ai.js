import { Entity } from "./entity.js";
import * as YUKA from "yuka";

function sync(entity, renderComponent) {
  renderComponent.matrix.copy(entity.worldMatrix);
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
    const params = {
      alignment: 1,
      cohesion: 0.9,
      separation: 0.3
    };
    alignmentBehavior.weight = params.alignment;
    cohesionBehavior.weight = params.cohesion;
    separationBehavior.weight = params.separation;

    for (let i = 0; i < 50; i++) {
      const vehicleMesh = new THREE.Mesh(vehicleGeometry, vehicleMaterial);
      vehicleMesh.matrixAutoUpdate = false;
      this.map.scene.add(vehicleMesh);

      const vehicle = new YUKA.Vehicle();
      vehicle.maxSpeed = 1.5;
      vehicle.updateNeighborhood = true;
      vehicle.neighborhoodRadius = 10;
      vehicle.rotation.fromEuler(0, Math.PI * Math.random(), 0);
      vehicle.position.x = 10 - Math.random() * 20;
      vehicle.position.z = 10 - Math.random() * 20;

      vehicle.setRenderComponent(vehicleMesh, sync);

      vehicle.steering.add(alignmentBehavior);
      vehicle.steering.add(cohesionBehavior);
      vehicle.steering.add(separationBehavior);

      const wanderBehavior = new YUKA.WanderBehavior();
      wanderBehavior.weight = 0.5;
      vehicle.steering.add(wanderBehavior);

      this.map.aiManager.add(vehicle);
    }
  }
}
