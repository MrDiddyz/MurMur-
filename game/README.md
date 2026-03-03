# Star Defender Game Scaffold

A complete HTML + JavaScript game scaffold with modular source files, static assets, and build/preview scripts.

## Project structure

- `index.html` – game shell for local development.
- `styles.css` – visual styles and UI layout.
- `assets/` – ship sprites in SVG format.
- `src/` – game modules (`game`, `player`, `enemy`, `input`, `ui`, `constants`, `main`).
- `dist/` – generated production-ready output.

## Commands

From repository root:

```bash
npm run game:build
npm run game:preview
```

For quick local iteration without build:

```bash
npm run game:dev
```

Then open <http://localhost:4173>.
