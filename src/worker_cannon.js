import * as CANNON from "cannon-es";
var world = new CANNON.World();
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 2;
// Materials
var playerMaterial = new CANNON.Material("playerMaterial");

// Adjust constraint equation parameters for ground/ground contact
var playerMaterial_cm = new CANNON.ContactMaterial("default", playerMaterial, {
  friction: 0,
  restitution: 0.3,
  frictionEquationRelaxation: 0,
  contactEquationStiffness: 1e8,
  contactEquationRelaxation: 3
});
world.addContactMaterial(playerMaterial_cm);
console.log("Startdd worker!!!!");
self.onmessage = function (message) {
  const callFunction = message.callFunction;
  const callParameters = message.callParameters;
  world[callFunction](...callParameters);
  self.postMessage("Finished updating world " + JSON.stringify(callParameters));
};
