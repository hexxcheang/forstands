# Booth plan sources

- `scene.js`: the 3D model (three.js r128). Units are metres; nothing is taller than 1.8 m.
- `build3.py`: draws the to-scale SVG plan, elevations and stand section, and inlines `scene.js`.
- `template3.html`: page text and styles, with `{{...}}` slots for the drawings.
- `render.js`: renders the still images with Playwright (headless Chromium, SwiftShader WebGL).

Rebuild the page from this folder:

    python3 build3.py ../index.html template3.html

`render.js` expects a test page that loads three.js and `scene.js`, and a local copy of the
`three@0.128.0` npm package one folder up, at `../npm3/package`. Adjust those paths to your setup.
