# 20251204_ParametricTower

An experimental WebGL parametric tower generator that stacks procedural slabs in the browser and exposes twist, scale, height, and gradient ranges through a lightweight slider UI. Three.js handles the rendering, while lil-gui, gsap, and tinycolor2 coordinate the interactive parameter workflow so designers can iterate without leaving the viewport.

## Features
- Client-only Vite + TypeScript stack with Three.js, OrbitControls, and lil-gui.
- Gradient-aware tower builder that interpolates twists, scales, and colors floor-by-floor with selectable easing curves.
- Smooth parameter transitions using gsap to keep slider changes responsive.
- Modularized scene, tower, UI, and utility layers for quick future extensions.

## Getting Started
1. `npm install` – install dependencies.
2. `npm run dev` – launch the Vite dev server at `http://localhost:5173`.
3. Adjust sliders in the lil-gui panel to regenerate the tower in real time.

## Controls
- `Floors` – total number of slabs.
- `Floor Height` – vertical spacing between slabs.
- `Slab Thickness` – extrusion depth per floor.
- `Base Radius` – base footprint for slabs before scaling.
- `Slab Sides` – number of faces for each slab footprint (3–10).
- `Twist Min/Max` – degrees of rotation applied from bottom to top.
- `Twist Curve` – easing profile (linear or quad variants) for how twist progresses.
- `Scale Min/Max` – per-floor scaling interpolation for tapering/bulging.
- `Scale Curve` – easing profile controlling how scale interpolates up the tower.
- `Gradient Start/End` – color stops for bottom and top of the tower.
- `Anim Duration` – easing time for parameter transitions.
