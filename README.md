# Scroll-driven Supra racing portfolio

A complete static GitHub Pages portfolio with a procedural racing-game-style mountain road, a hand-drawn Supra-inspired SVG rear-view sports car, and red trails that are drawn only **behind** the car as you scroll. All visuals are generated locally with Canvas and SVG; there are no third-party image dependencies.

## Upload to GitHub

1. Unzip this archive.
2. Open https://github.com/concepcionjestin/jestinconcepcion
3. In the repository root, upload/replace `index.html`, `style.css`, and `script.js`. Commit.
4. Create `assets` if it doesn't exist by creating `assets/.gitkeep`, then upload `assets/supra.svg` into it. Keep the folder name exactly `assets`.
5. In **Settings > Pages**, deploy from branch `main`, folder `/ (root)`.
6. Visit https://concepcionjestin.github.io/jestinconcepcion/ after deployment.

## Preview locally

Open `index.html` in Chrome. The Canvas background and SVG asset work without any build process.

## Customize

- `style.css`: change `--red` and the homepage text styling.
- `script.js`: edit `path(t)` for a different curve, and `.drive` height in CSS for animation duration.
- `assets/supra.svg`: editable vector car artwork. This is a stylized Supra-inspired illustration, not an exact licensed 3D model.
- Add your own `assets/resume.pdf` to activate the résumé link; until then it is a placeholder.
- Replace project summaries with your final validated project results. No contact email was guessed.

This is a 2D racing-game aesthetic, not a fully modeled 3D driving simulation. The car and trails move along the same programmatic road path. It supports reverse scrolling and mobile screens.
