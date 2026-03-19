import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
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
cpSync(join(sourceDir, 'index.html'), join(distDir, 'index.html'));

console.log('Game build completed at game/dist');
