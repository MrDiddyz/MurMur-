import { ENEMY_COLS, ENEMY_HIT_POINTS, ENEMY_ROWS, ENEMY_SPEED_BASE } from './constants.js';

export function createEnemyWave(level) {
  const enemies = [];
  const spacingX = 70;
  const spacingY = 50;
  const startX = 90;
  const startY = 60;

  for (let row = 0; row < ENEMY_ROWS; row += 1) {
    for (let col = 0; col < ENEMY_COLS; col += 1) {
      enemies.push({
        x: startX + col * spacingX,
        y: startY + row * spacingY,
        width: 36,
        height: 24,
        hp: ENEMY_HIT_POINTS,
        points: 10 + row * 5,
        direction: 1,
        speed: ENEMY_SPEED_BASE + level * 12
      });
    }
  }

  return enemies;
}

export function updateEnemies(enemies, deltaTime) {
  let edgeHit = false;

  for (const enemy of enemies) {
    enemy.x += enemy.direction * enemy.speed * deltaTime;
    if (enemy.x < 8 || enemy.x + enemy.width > 792) {
      edgeHit = true;
    }
  }

  if (edgeHit) {
    for (const enemy of enemies) {
      enemy.direction *= -1;
      enemy.y += 16;
    }
  }
}

export function drawEnemies(ctx, enemies, sprite) {
  for (const enemy of enemies) {
    if (sprite?.complete) {
      ctx.drawImage(sprite, enemy.x, enemy.y, enemy.width, enemy.height);
    } else {
      ctx.fillStyle = '#ff5fd4';
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
  }
}
