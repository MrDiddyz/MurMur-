import { GameLoop } from './gameLoop.js';

export class Engine {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
  }

  start() {
    const loop = new GameLoop(this);
    loop.start();
    return loop;
  }
}
