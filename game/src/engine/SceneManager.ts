import * as THREE from "three"

export class SceneManager {
  scene: THREE.Scene

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  add(object: THREE.Object3D) {
    this.scene.add(object)
  }

  remove(object: THREE.Object3D) {
    this.scene.remove(object)
  }

  clear() {
    this.scene.clear()
  }
}
