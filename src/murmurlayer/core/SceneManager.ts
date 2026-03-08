export class SceneManager {
  private rafId: number | null = null;
  private frame = 0;

  nextFrame() {
    this.frame += 1;
    return this.frame;
  }

  schedule(draw: () => void) {
    this.rafId = requestAnimationFrame(draw);
  }

  cancel() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
