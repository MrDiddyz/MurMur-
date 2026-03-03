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

  bindTouchControls({ leftButton, rightButton, shootButton }) {
    this.attachHoldButton(leftButton, 'touch-left');
    this.attachHoldButton(rightButton, 'touch-right');
    this.attachTapButton(shootButton);
  }

  attachHoldButton(button, key) {
    if (!button) return;

    const press = (event) => {
      event.preventDefault();
      this.keys.add(key);
    };

    const release = (event) => {
      event.preventDefault();
      this.keys.delete(key);
    };

    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', release);
  }

  attachTapButton(button) {
    if (!button) return;
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      this.shootPressed = true;
    });
  }

  get left() {
    return this.keys.has('arrowleft') || this.keys.has('a') || this.keys.has('touch-left');
  }

  get right() {
    return this.keys.has('arrowright') || this.keys.has('d') || this.keys.has('touch-right');
  }

  consumeShoot() {
    if (!this.shootPressed) return false;
    this.shootPressed = false;
    return true;
  }
}
