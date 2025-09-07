export class FakeClock {
  constructor(initialTime = new Date()) {
    this.currentTime = new Date(initialTime);
  }

  now() {
    return new Date(this.currentTime);
  }

  tick(milliseconds) {
    this.currentTime = new Date(this.currentTime.getTime() + milliseconds);
  }

  setTime(time) {
    this.currentTime = new Date(time);
  }

  advance(milliseconds) {
    this.tick(milliseconds);
  }
}
