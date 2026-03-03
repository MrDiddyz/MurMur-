import { BULLET_SPEED, GAME_WIDTH, PLAYER_SPEED } from './constants.js';

export class Player {
  constructor() {
    this.width = 48;
    this.height = 28;
    this.x = GAME_WIDTH / 2 - this.width / 2;
    this.y = 450;
    this.cooldown = 0;
  }

  update(deltaTime, input) {
    if (input.left) this.x -= PLAYER_SPEED * deltaTime;
    if (input.right) this.x += PLAYER_SPEED * deltaTime;
    this.x = Math.max(0, Math.min(GAME_WIDTH - this.width, this.x));
    if (this.cooldown > 0) this.cooldown -= deltaTime;
  }

  shoot() {
    if (this.cooldown > 0) return null;
    this.cooldown = 0.25;
    return {
      x: this.x + this.width / 2 - 2,
      y: this.y,
      width: 4,
      height: 16,
      vy: -BULLET_SPEED,
      color: '#89e6ff'
    };
  }

  draw(ctx, sprite) {
    if (sprite?.complete) {
      ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = '#7ae1ff';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}
