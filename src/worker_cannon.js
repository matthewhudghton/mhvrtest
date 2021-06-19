self.onmessage = function (message) {
  const world = message.world;
  const dt = message.dt;
  world.update(dt);
};
