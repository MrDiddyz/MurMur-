import * as THREE from "three"
import { SceneManager } from "./SceneManager"
import { GameLoop } from "./GameLoop"

export class Engine {
  scene: THREE.Scene
  camera: THREE.Camera
  renderer: THREE.WebGLRenderer
  sceneManager: SceneManager
  loop: GameLoop | null

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer
  ) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.sceneManager = new SceneManager(scene)
    this.loop = null
  }

  start() {
    if (this.loop) return

    this.loop = new GameLoop(this)
    this.loop.start()
  }

  stop() {
    if (!this.loop) return

    this.loop.stop()
    this.loop = null
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }
}
