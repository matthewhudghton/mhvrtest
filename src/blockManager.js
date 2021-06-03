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
    this.segmentLookAhead = 1;
    this.segmentTooFarLimit = 2;
  }

  addSegementsFromLookAhead() {
    const segment = this.currentSegment;
    for (let dx = -this.segmentLookAhead; dx <= this.segmentLookAhead; dx++) {
      for (let dy = -this.segmentLookAhead; dy <= this.segmentLookAhead; dy++) {
        for (
          let dz = -this.segmentLookAhead;
          dz <= this.segmentLookAhead;
          dz++
        ) {
          const x = segment.x + dx;
          const y = segment.y + dy;
          const z = segment.z + dz;
          if (!this.hasBlockForSegment(x, y, z)) {
            this.addBlocksForSegment(x, y, z);
          }
        }
      }
    }
  }
  removeFarAwaySegments() {
    /* Delete all x */
    for (let x in this.blocks) {
      if (x < -this.segmentTooFarLimit || x > this.segmentTooFarLimit) {
        for (let y in this.blocks[x]) {
          for (let z in this.blocks[x][y]) {
            for (let i in this.blocks[x][y][z]) {
              const block = this.blocks[x][y][z][i];
              block.forceKill();
            }
          }
          this.blocks[x] = undefined;
        }
      }
    }

    /* Delete all too far y */
    for (let x in this.blocks) {
      for (let y in this.blocks[x]) {
        if (y < -this.segmentTooFarLimit || y > this.segmentTooFarLimit) {
          for (let z in this.blocks[x][y]) {
            for (let i in this.blocks[x][y][z]) {
              const block = this.blocks[x][y][z][i];
              block.forceKill();
            }
          }
          this.blocks[x][y] = undefined;
        }
      }
    }

    /* Delete all too far z  */
    for (let x in this.blocks) {
      for (let y in this.blocks[x]) {
        for (let z in this.blocks[x][y]) {
          if (z < -this.segmentTooFarLimit || z > this.segmentTooFarLimit) {
            for (let i in this.blocks[x][y][z]) {
              const block = this.blocks[x][y][z][i];
              block.forceKill();
            }
            this.blocks[x][y][z] = undefined;
          }
        }
      }
    }
  }

  update(dt) {
    if (this.player === undefined) {
      return;
    }
    this.addSegementsFromLookAhead();
    this.removeFarAwaySegments();
  }

  addBlocksForSegment(x, y, z) {
    for (let i = 0; i < this.blocksPerSegment; i++) {
      let block = this.makeNewBlock(x, y, z);
      this.addBlockForSegment(x, y, z, block);
    }
  }

  addBlockForSegment(x, y, z, block) {
    this.blocks[x] ??= { [y]: { [z]: [] } };
    this.blocks[x][y] ??= { [z]: [] };
    this.blocks[x][y][z] ??= [];
    this.blocks[x][y][z].push(block);
  }

  hasBlockForSegment(x, y, z) {
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

  makeNewBlock(segmentX, segmentY, segmentZ) {
    const width = this.blockBaseSize + Math.random() * this.blockMaxSize;
    const height = this.blockBaseSize + Math.random() * this.blockMaxSize;
    const depth = this.blockBaseSize + Math.random() * this.blockMaxSize;
    let x = this.getRandom1DPositionWithInSegment(segmentX);
    let y = this.getRandom1DPositionWithInSegment(segmentY);
    let z = this.getRandom1DPositionWithInSegment(segmentZ);

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
      x: Math.round(position.x / this.segmentSize),
      y: Math.round(position.y / this.segmentSize),
      z: Math.round(position.z / this.segmentSize)
    };
  }
}
