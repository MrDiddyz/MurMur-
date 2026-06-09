import * as THREE from "three"

export class SceneManager {
  scene: THREE.Scene
  currentRoom: THREE.Group | null

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.currentRoom = null
  }

  loadRoom(room: THREE.Group) {
    if (this.currentRoom) {
      this.scene.remove(this.currentRoom)
    }

    this.scene.add(room)
    this.currentRoom = room
  }

  clear() {
    if (!this.currentRoom) return

    this.scene.remove(this.currentRoom)
    this.currentRoom = null
  }
}
