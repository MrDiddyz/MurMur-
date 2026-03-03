export class Input {
  constructor() {
    this.keys = new Set();
    this.shootPressed = false;

    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      if (['arrowleft', 'arrowright', 'a', 'd', ' '].includes(key)) {
        event.preventDefault();
      }
      this.keys.add(key);
      if (key === ' ') this.shootPressed = true;
    });

    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.key.toLowerCase());
    });
  }

  get left() {
    return this.keys.has('arrowleft') || this.keys.has('a');
  }

  get right() {
    return this.keys.has('arrowright') || this.keys.has('d');
  }

  consumeShoot() {
    if (!this.shootPressed) return false;
    this.shootPressed = false;
    return true;
  }
}
