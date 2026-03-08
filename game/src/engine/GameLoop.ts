import type { Engine } from "./Engine"

export class GameLoop {
  private engine: Engine
  private animationFrame: number | null

  constructor(engine: Engine) {
    this.engine = engine
    this.animationFrame = null
  }

  start() {
    if (this.animationFrame !== null) return

    const tick = () => {
      this.engine.render()
      this.animationFrame = requestAnimationFrame(tick)
    }

    this.animationFrame = requestAnimationFrame(tick)
  }

  stop() {
    if (this.animationFrame === null) return

    cancelAnimationFrame(this.animationFrame)
    this.animationFrame = null
  }
}
