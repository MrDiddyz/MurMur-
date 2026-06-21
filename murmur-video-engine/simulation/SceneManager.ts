import * as THREE from "three";
import { RoomData, RoomGenerator } from "./RoomGenerator";

export class SceneManager {
  scene: THREE.Scene;
  currentRoom: THREE.Group | null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.currentRoom = null;
  }

  async loadRoom(roomData: RoomData): Promise<void> {
    if (this.currentRoom) {
      this.scene.remove(this.currentRoom);
    }

    const room = await RoomGenerator.generate(roomData);

    this.scene.add(room);
    this.currentRoom = room;
  }
}
