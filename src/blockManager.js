import { Block } from "./block";
import * as THREE from "three";
import * as CANNON from "cannon-es";

export class BlockManager {
  constructor(options) {
    this.blocks = {};
    this.map = options.map;
    this.segmentSize = 500;
    this.blockBaseSize = 10;
    this.blockMaxSize = 150;
    this.blocksPerSegment = 15;
  }

  update(dt) {
    if (this.player === undefined) {
      return;
    }
    if (!this.hasBlockForCurrentSegment()) {
      this.addBlocksForCurrentSegment();
    }
  }

  addBlocksForCurrentSegment() {
    let segment = this.currentSegment;
    console.log("Adding blocks for segment" + JSON.stringify(segment));
    for (let i = 0; i < this.blocksPerSegment; i++) {
      let block = this.makeNewBlock(segment);
      this.addBlockForSegment(segment.x, segment.y, segment.z, block);
    }
  }

  addBlockForSegment(x, y, z, block) {
    this.blocks[x] ??= { [y]: { [z]: [] } };
    this.blocks[x][y] ??= { [z]: [] };
    this.blocks[x][y][z] ??= [];
    this.blocks[x][y][z].push(block);
  }

  hasBlockForCurrentSegment() {
    return this.hasBlockForSegment(this.currentSegment);
  }

  hasBlockForSegment(segment) {
    const x = segment.x;
    const y = segment.y;
    const z = segment.z;
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
      segment1DPosition * this.segmentSize +
      (Math.random() * this.segmentSize - this.segmentSize / 2)
    );
  }

  makeNewBlock(segment) {
    const width = this.blockBaseSize + Math.random() * this.blockMaxSize;
    const height = this.blockBaseSize + Math.random() * this.blockMaxSize;
    const depth = this.blockBaseSize + Math.random() * this.blockMaxSize;
    let x = this.getRandom1DPositionWithInSegment(segment.x);
    let y = this.getRandom1DPositionWithInSegment(segment.y);
    let z = this.getRandom1DPositionWithInSegment(segment.z);

    /* protect the player starting point */
    if (x < width) {
      x -= width;
    }
    if (x > width) {
      x += width;
    }

    return new Block({
      map: this.map,
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

  get player() {
    return this.map.player;
  }

  get position() {
    return this.player.position;
  }

  get currentSegment() {
    let position = this.position;
    return {
      x: Math.floor(position.x / this.segmentSize),
      y: Math.floor(position.y / this.segmentSize),
      z: Math.floor(position.z / this.segmentSize)
    };
  }
}
