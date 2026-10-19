# Performance Coupe Portfolio — Scroll-to-Enter Edition

A generic, unbranded high-performance coupe now **cuts in only after scrolling begins**. At the top of the page the road is empty. Around 5% into the scroll the car enters from the bottom-left and merges onto the road; then it drives into the distance. Red trails grow only once it starts traveling down the road.

## Install on GitHub Pages
Upload `index.html`, `style.css`, and `script.js` to the **root** of your repository and commit them. These three files are all that is needed for the animated scene. Your other portfolio sections are preserved. No car image is required.

The `assets` directory is optional and can hold your own `resume.pdf`.

## Customize
In `script.js`, `progress<=.045` controls when the car first appears; `(progress-.045)/.15` controls how quickly it cuts in; `(progress-.16)/.84` controls its drive away. The animation is intentionally stylized Canvas 2D, not a photorealistic 3D render.
