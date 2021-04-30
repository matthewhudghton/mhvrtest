import System from "three-nebula";

export class Emitter {
  constructor(options) {
    this.system = options.system;
    new System.fromJSONAsync("./my-particle-system.json", THREE).then(
      (system) => {
        console.log(system);
      }
    );
  }
}
