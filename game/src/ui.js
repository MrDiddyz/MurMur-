export class UI {
  constructor() {
    this.score = document.getElementById('score');
    this.lives = document.getElementById('lives');
    this.level = document.getElementById('level');
    this.overlay = document.getElementById('overlay');
    this.overlayTitle = document.getElementById('overlay-title');
    this.overlayMessage = document.getElementById('overlay-message');
    this.restart = document.getElementById('restart');
  }

  update(stats) {
    this.score.textContent = `Score: ${stats.score}`;
    this.lives.textContent = `Lives: ${stats.lives}`;
    this.level.textContent = `Level: ${stats.level}`;
  }

  showOverlay(title, message) {
    this.overlayTitle.textContent = title;
    this.overlayMessage.textContent = message;
    this.overlay.classList.remove('hidden');
  }

  hideOverlay() {
    this.overlay.classList.add('hidden');
  }

  onRestart(handler) {
    this.restart.addEventListener('click', handler);
  }
}
