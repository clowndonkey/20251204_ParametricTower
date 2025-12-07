import './style.css';
import { Color, MathUtils, type Group } from 'three';
import { createScene } from './core/scene';
import { buildTower } from './tower/towerGenerator';
import { createControlPanel, defaultParams } from './ui/controls';
import type { ControlPanelAPI } from './ui/controls';
import { ParamAnimator } from './state/paramAnimator';
import { exportTowerToOBJ } from './export/objExporter';
import { downloadTextFile, downloadDataUrl } from './utils/download';
import type { ExportFormat } from './types/export';
import type { TowerParameterState } from './types/params';
import { createBezierGraph } from './ui/bezierGraph';

const mount = document.querySelector<HTMLDivElement>('#app');

if (!mount) {
  throw new Error('Mount element #app not found');
}

mount.innerHTML = '';

const instructions = document.createElement('div');
instructions.className = 'instructions';
instructions.innerHTML = `<strong>Use the sliders to sculpt floor count, twisting, scaling, and colors. Orbit with your mouse to inspect the tower.</strong>
LEFT MOUSE orbit<br />
RIGHT MOUSE pan<br />
SCROLL zoom`;
document.body.appendChild(instructions);

const { scene, camera, renderer, controls, ambientLight, ground } =
  createScene(mount);
renderer.shadowMap.enabled = true;

const animator = new ParamAnimator(defaultParams);
let tower: Group | null = null;
let currentParams = defaultParams;
let panelApi: ControlPanelAPI | null = null;

const bezierGraph = createBezierGraph(defaultParams.scaleGraph, (graphState) => {
  panelApi?.applyScaleGraph(graphState);
});

const applyEnvironment = (state: TowerParameterState) => {
  scene.background = new Color(state.backgroundColor);
  ambientLight.intensity = state.ambientIntensity;
  renderer.shadowMap.enabled = state.enableShadows;

  tower?.traverse((child) => {
    child.castShadow = state.enableShadows;
    child.receiveShadow = state.enableShadows;
  });

  ground.receiveShadow = state.enableShadows;
};

animator.subscribe((state) => {
  currentParams = state;
  if (tower) {
    scene.remove(tower);
  }
  tower = buildTower(state);
  scene.add(tower);
  applyEnvironment(state);
  bezierGraph.update(state.scaleGraph);
  if (!state.useScaleGraph) {
    bezierGraph.setVisible(false);
  }
});

const timestampString = () =>
  new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_');

const handleExport = (format: ExportFormat) => {
  if (!tower) {
    return;
  }

  if (format === 'obj') {
    const objData = exportTowerToOBJ(tower);
    downloadTextFile(`parametric_tower_${timestampString()}.obj`, objData);
  }
};

const handleImageCapture = () => {
  const dataUrl = renderer.domElement.toDataURL('image/png');
  downloadDataUrl(`parametric_tower_${timestampString()}.png`, dataUrl);
};

type SavedState = {
  name: string;
  params: TowerParameterState;
};

const savedStates: SavedState[] = [];

const panel = createControlPanel(defaultParams, {
  onChange: (state) => animator.tweenTo(state),
  onExport: handleExport,
  onCaptureImage: handleImageCapture,
  onSaveState: () => {
    const defaultName = `State ${savedStates.length + 1}`;
    const name = window
      .prompt('Name for this saved state?', defaultName)
      ?.trim();

    if (!name) {
      return;
    }

    const snapshot: TowerParameterState = { ...currentParams };
    const existing = savedStates.find((entry) => entry.name === name);

    if (existing) {
      existing.params = snapshot;
    } else {
      savedStates.push({ name, params: snapshot });
    }

    panel.updateSavedStateOptions(savedStates.map((entry) => entry.name));
  },
  onLoadState: (name) => {
    const saved = savedStates.find((entry) => entry.name === name);
    if (saved) {
      animator.tweenTo({ ...saved.params });
    }
  },
  onToggleScaleGraph: (enabled) => {
    if (enabled) {
      bezierGraph.update(currentParams.scaleGraph);
      bezierGraph.setVisible(true);
    } else {
      bezierGraph.setVisible(false);
    }
  },
});
panelApi = panel;

let lastTime = performance.now();

const tick = (time: number) => {
  const deltaSeconds = Math.max((time - lastTime) / 1000, 0);
  lastTime = time;

  if (tower && currentParams.autoSpin) {
    const spinPerSecond = MathUtils.degToRad(currentParams.spinDegrees);
    tower.rotation.y += spinPerSecond * deltaSeconds;
  }

  controls.update();
  renderer.render(scene, camera);

  requestAnimationFrame(tick);
};

requestAnimationFrame(tick);
