import { Block } from "./block";
import * as THREE from "three";
import * as CANNON from "cannon-es";

export class BlockManager {
  constructor(options) {
    this.player = options.player;
    this.blocks = {};
    this.segmentSize = 500;
    this.blockBaseSize = 10;
    this.blockMaxSize = 150;
    this.blocksPerSegment = 15;
  }

  addBlocksForCurrentPosition() {
    let position = this.player.position;
    let block = this.makeNewBlock(position.x, position.y, position.z);
    this.addBlockForPosition(position.x, position.y, position.z, block);
  }

  addBlockForPosition(x, y, z, block) {
    this.blocks[x] ??= { [y]: { [z]: undefined } };
    this.blocks[x][y] ??= { [z]: [] };
    this.blocks[x][y][z].push(block);
  }

  hasBlockForCurrentPlayerPosition(x, y, z) {
    if (
      this.blocks[x] !== undefined &&
      this.blocks[x][y] !== undefined &&
      this.blocks[x][y][z] !== undefined &&
      this.blocks[x][y][z].length > 0
    ) {
      return true;
    }
    return false;
  }

  getRandom1DPositionWithInSegment(segment1DPosition) {
    return (
      (segment1DPosition - 1) * this.segmentSize +
      (Math.random() * this.segmentSize - this.segmentSize / 2)
    );
  }

  makeNewBlock(position) {
    const width = this.blockBaseSize + Math.random() * this.blockMaxSize;
    const height = this.blockBaseSize + Math.random() * this.blockMaxSize;
    const depth = this.blockBaseSize + Math.random() * this.blockMaxSize;
    let x = this.getRandom1DPositionWithInSegment(position.x);
    let y = this.getRandom1DPositionWithInSegment(position.y);
    let z = this.getRandom1DPositionWithInSegment(position.z);

    /* protect the player starting point */
    if (x < width) {
      x -= width;
    }
    if (x > width) {
      x += width;
    }

    return new Block({
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

  get position() {
    return this.player.position;
  }
}
