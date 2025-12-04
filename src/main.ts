import './style.css';
import type { Group } from 'three';
import { createScene } from './core/scene';
import { buildTower } from './tower/towerGenerator';
import { createControlPanel, defaultParams } from './ui/controls';
import { ParamAnimator } from './state/paramAnimator';

const mount = document.querySelector<HTMLDivElement>('#app');

if (!mount) {
  throw new Error('Mount element #app not found');
}

mount.innerHTML = '';

const { scene, camera, renderer, controls } = createScene(mount);
renderer.shadowMap.enabled = true;

const animator = new ParamAnimator(defaultParams);
let tower: Group | null = null;

animator.subscribe((state) => {
  if (tower) {
    scene.remove(tower);
  }
  tower = buildTower(state);
  scene.add(tower);
});

createControlPanel(defaultParams, (state) => animator.tweenTo(state));

const tick = () => {
  requestAnimationFrame(tick);
  controls.update();
  renderer.render(scene, camera);
};

tick();
