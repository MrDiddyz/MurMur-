import * as THREE from "three";

export type RoomData = {
  name?: string;
  metadata?: Record<string, unknown>;
};

export class RoomGenerator {
  static async generate(roomData: RoomData): Promise<THREE.Group> {
    const room = new THREE.Group();

    room.name = roomData.name ?? "room";
    room.userData = {
      ...roomData.metadata,
      generatedAt: new Date().toISOString(),
    };

    return room;
  }
}
