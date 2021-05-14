import { Actor } from "./actor";
import * as YUKA from "yuka";

export class Map {
  constructor(scene, world, player) {
    this.scene = scene;
    this.world = world;
    this.actors = [];
    this.aiManager = new YUKA.EntityManager();
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
