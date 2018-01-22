'use strict';

class TestClock {

  constructor(sinon) {
    this.initialized = false;
    this.clock = null;
    this._sinon = sinon;
  }

  setup(time) {
    this.initialized = true;
    this.clock = this._sinon.useFakeTimers(Date.parse(time));
  }

  tick(time) {
    this.clock.tick(time);
  }

  teardown() {
    if (!this.initialized) {
      return;
    }
    this.initialized = false;
    this.clock.restore();
  }

}

module.exports = TestClock;
