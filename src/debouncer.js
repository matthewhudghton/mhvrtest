export class Debouncer {
  constructor(length, current) {
    this.length = length;
    this.current = current ?? 0;
  }
  update(dt) {
    if (this.current < this.length) {
      this.current += dt;
    }
  }

  get shouldFire() {
    return this.current >= this.length;
  }

  get fractionComplete() {
    return this.current / this.length;
  }

  hasFiredLastUpdate() {
    return this.current == 0;
  }

  tryFireAndReset() {
    if (this.shouldFire) {
      this.current = 0;
      return true;
    }
    return false;
  }
}
