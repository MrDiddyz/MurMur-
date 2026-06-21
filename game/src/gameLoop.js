export class GameLoop {
  constructor(engine) {
    this.engine = engine;
    this.running = false;
    this._frameId = null;
    this._tick = this._tick.bind(this);
  }

  start() {
    if (this.running) {
      return;
    }

    this.running = true;
    this._frameId = requestAnimationFrame(this._tick);
  }

  stop() {
    this.running = false;

    if (this._frameId !== null) {
      cancelAnimationFrame(this._frameId);
      this._frameId = null;
    }
  }

  _tick() {
    if (!this.running) {
      return;
    }

    this.engine.renderer.render(this.engine.scene, this.engine.camera);
    this._frameId = requestAnimationFrame(this._tick);
  }
}
