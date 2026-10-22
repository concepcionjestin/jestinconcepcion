# Opposing light trails portfolio

No car or external car image is used. The road is procedurally drawn in the HTML canvas.

- Red twin light trails travel from the bottom toward the top **to the right of the yellow dashed center line**.
- White twin light trails travel from the top toward the bottom **to the left of the yellow dashed center line**.
- Both start hidden and extend in opposite directions as you scroll; scrolling up retracts them.
- About, Projects, Experience, and Contact sections remain in place.

## GitHub upload
1. Extract this ZIP.
2. Open https://github.com/concepcionjestin/jestinconcepcion
3. Upload `index.html`, `style.css`, and `script.js` into the **repository root**, replacing the previous files. Keep the names exactly.
4. Commit to `main` and wait for GitHub Pages to deploy.
5. Hard-refresh the site with Cmd+Shift+R.

The `assets` directory is optional; upload your own `assets/resume.pdf` to enable the résumé link.

## Troubleshooting
If you see a static scene, verify that `script.js` is in the same folder as `index.html`. In browser developer tools, check the Console for JavaScript errors. The effect is tied to scrolling over the tall homepage section.
