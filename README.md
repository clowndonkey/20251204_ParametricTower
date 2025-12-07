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
- **Structure** – `Floors`, `Floor Height`, `Slab Thickness`, `Base Radius`, `Slab Sides`.
- **Twist Gradient** – `Twist Min/Max` plus `Twist Curve` easing presets.
- **Scale Gradient** – `Scale Min/Max`, `Scale Curve`, and a `Use Graph` toggle that opens a draggable Bezier editor for custom scaling falloffs.
- **Gradient Colors** – `Gradient Start/End` for bottom-to-top vertex colors.
- **Motion** – `Auto Spin` toggle and `Spin Degrees` (per-second rotation, negative to reverse).
- **Environment** – background color picker, `Shadows` toggle, and `Ambient Light` slider to lift/dim the scene.
- **Save** – `Mesh (.obj)` for geometry export, `Image` for viewport screenshots, `State` for storing presets plus a dropdown to reapply them.
- `Transition Smoothness` – easing time for parameter transitions.
