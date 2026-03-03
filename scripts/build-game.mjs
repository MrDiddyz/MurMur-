import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const sourceDir = join(root, 'game');
const distDir = join(sourceDir, 'dist');

if (!existsSync(sourceDir)) {
  console.error('Missing game source directory.');
  process.exit(1);
}

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });
cpSync(join(sourceDir, 'assets'), join(distDir, 'assets'), { recursive: true });
cpSync(join(sourceDir, 'src'), join(distDir, 'src'), { recursive: true });
cpSync(join(sourceDir, 'styles.css'), join(distDir, 'styles.css'));

const htmlTemplate = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Star Defender</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <main class="layout">
      <header>
        <h1>Star Defender</h1>
        <p>Move with ← → or A D. Press Space to shoot.</p>
      </header>
      <section class="hud">
        <span id="score">Score: 0</span>
        <span id="lives">Lives: 3</span>
        <span id="level">Level: 1</span>
      </section>
      <canvas id="game" width="800" height="500" aria-label="Star Defender game canvas"></canvas>
      <section id="overlay" class="overlay hidden">
        <div>
          <h2 id="overlay-title">Game Over</h2>
          <p id="overlay-message"></p>
          <button id="restart">Restart</button>
        </div>
      </section>
    </main>
    <script type="module" src="./src/main.js"></script>
  </body>
</html>`;

writeFileSync(join(distDir, 'index.html'), htmlTemplate);
console.log('Game build completed at game/dist');
