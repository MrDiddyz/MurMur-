export class GameLoop {
  engine: { render: () => void };
  frameId: number | null;

  constructor(engine: { render: () => void }) {
    this.engine = engine;
    this.frameId = null;
  }

  start() {
    const animate = () => {
      this.engine.render();
      this.frameId = requestAnimationFrame(animate);
    };

    animate();
  }

  stop() {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }
}
