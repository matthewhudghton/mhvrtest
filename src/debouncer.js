export class Debouncer {
  constructor(length, current, rechargeRate) {
    this.length = length;
    this.current = current ?? 0;
    this.rechargeRate = rechargeRate ?? 1;
  }
  update(dt) {
    if (this.current < this.length) {
      this.current += this.rechargeRate * dt;
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

  tryFireAndUseCharge(charge) {
    if (this.current >= charge) {
      this.current -= charge;
      return true;
    }
    return false;
  }

  tryFireAndForceUseCharge(charge) {
    if (this.current >= charge) {
      this.current -= charge;
      return true;
    } else {
      this.current = 0;
      return false;
    }
  }
}
