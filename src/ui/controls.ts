import GUI from 'lil-gui';
import type {
  BezierGraphState,
  GradientCurve,
  ParamChangeHandler,
  TowerParameterState,
} from '../types/params';
import type { ExportHandler } from '../types/export';

const curveOptions: Record<string, GradientCurve> = {
  Linear: 'linear',
  'Ease In Quad': 'easeInQuad',
  'Ease Out Quad': 'easeOutQuad',
  'Ease In/Out Quad': 'easeInOutQuad',
};

export const defaultParams: TowerParameterState = {
  floorCount: 10,
  floorHeight: 1,
  floorThickness: 0.5,
  baseRadius: 5,
  sides: 5,
  twistMin: 0,
  twistMax: 0,
  twistCurve: 'easeInOutQuad',
  scaleMin: 1,
  scaleMax: 1,
  useScaleGraph: false,
  scaleGraph: {
    x1: 0.2,
    y1: 0.05,
    x2: 0.8,
    y2: 0.95,
    startY: 0,
    endY: 1,
  },
  scaleCurve: 'easeOutQuad',
  gradientStart: '#aa0e0e',
  gradientEnd: '#f5d547',
  animationDuration: 0.35,
  autoSpin: true,
  spinDegrees: 10,
  backgroundColor: '#65788b',
  enableShadows: true,
  ambientIntensity: 0.4,
};

interface ControlPanelHandlers {
  onChange: ParamChangeHandler;
  onExport: ExportHandler;
  onCaptureImage: () => void;
  onSaveState: () => void;
  onLoadState: (name: string) => void;
  onToggleScaleGraph: (enabled: boolean) => void;
}

export interface ControlPanelAPI {
  gui: GUI;
  updateSavedStateOptions: (names: string[]) => void;
  applyScaleGraph: (graph: BezierGraphState) => void;
}

export const createControlPanel = (
  initial: TowerParameterState,
  handlers: ControlPanelHandlers,
): ControlPanelAPI => {
  const state = { ...initial };
  const gui = new GUI();

  const emitChange = () => handlers.onChange({ ...state });

  const applyScaleGraph = (graph: BezierGraphState) => {
    state.scaleGraph = { ...graph };
    emitChange();
  };

  const structureFolder = gui.addFolder('Structure');
  structureFolder
    .add(state, 'floorCount', 0, 60, 1)
    .name('Floors')
    .onChange(emitChange);
  structureFolder
    .add(state, 'floorHeight', 0, 20, 0.1)
    .name('Floor Height')
    .onChange(emitChange);
  structureFolder
    .add(state, 'floorThickness', 0, 10, 0.01)
    .name('Slab Thickness')
    .onChange(emitChange);
  structureFolder
    .add(state, 'baseRadius', 0, 100, 0.5)
    .name('Base Radius')
    .onChange(emitChange);
  structureFolder
    .add(state, 'sides', 3, 30, 1)
    .name('Slab Sides')
    .onChange(emitChange);

  const twistFolder = gui.addFolder('Twist Gradient');
  twistFolder
    .add(state, 'twistMin', -360, 360, 1)
    .name('Twist Min')
    .onChange(() => {
      if (state.twistMin > state.twistMax) {
        state.twistMax = state.twistMin;
      }
      emitChange();
    });
  twistFolder
    .add(state, 'twistMax', -360, 360, 1)
    .name('Twist Max')
    .onChange(() => {
      if (state.twistMax < state.twistMin) {
        state.twistMin = state.twistMax;
      }
      emitChange();
    });
  twistFolder
    .add(state, 'twistCurve', curveOptions)
    .name('Twist Curve')
    .onChange(emitChange);

  const scaleFolder = gui.addFolder('Scale Gradient');
  scaleFolder
    .add(state, 'scaleMin', 0.1, 10, 0.01)
    .name('Scale Min')
    .onChange(() => {
      if (state.scaleMin > state.scaleMax) {
        state.scaleMax = state.scaleMin;
      }
      emitChange();
    });
  scaleFolder
    .add(state, 'scaleMax', 0.1, 10, 0.01)
    .name('Scale Max')
    .onChange(() => {
      if (state.scaleMax < state.scaleMin) {
        state.scaleMin = state.scaleMax;
      }
      emitChange();
    });
  scaleFolder
    .add(state, 'scaleCurve', curveOptions)
    .name('Scale Curve')
    .onChange(emitChange);
  scaleFolder
    .add(state, 'useScaleGraph')
    .name('Use Graph')
    .onChange((value: boolean) => {
      emitChange();
      handlers.onToggleScaleGraph(value);
    });

  const colorsFolder = gui.addFolder('Gradient Colors');
  colorsFolder
    .addColor(state, 'gradientStart')
    .name('Gradient Start')
    .onChange(emitChange);
  colorsFolder
    .addColor(state, 'gradientEnd')
    .name('Gradient End')
    .onChange(emitChange);

  const motionFolder = gui.addFolder('Motion');
  motionFolder
    .add(state, 'autoSpin')
    .name('Auto Spin')
    .onChange(emitChange);
  motionFolder
    .add(state, 'spinDegrees', -180, 180, 1)
    .name('Spin Degrees')
    .onChange(emitChange);

  const environmentFolder = gui.addFolder('Environment');
  environmentFolder
    .addColor(state, 'backgroundColor')
    .name('Background')
    .onChange(emitChange);
  environmentFolder
    .add(state, 'enableShadows')
    .name('Shadows')
    .onChange(emitChange);
  environmentFolder
    .add(state, 'ambientIntensity', 0, 2, 0.05)
    .name('Ambient Light')
    .onChange(emitChange);

  const saveFolder = gui.addFolder('Save');
  saveFolder
    .add(
      {
        mesh: () => handlers.onExport('obj'),
      },
      'mesh',
    )
    .name('Mesh (.obj)');
  saveFolder
    .add(
      {
        image: () => handlers.onCaptureImage(),
      },
      'image',
    )
    .name('Image');
  saveFolder
    .add(
      {
        stateSave: () => handlers.onSaveState(),
      },
      'stateSave',
    )
    .name('State');

  const savedStateConfig = { selected: '' };
  const savedStateController = saveFolder
    .add(savedStateConfig, 'selected', { 'No States': '' })
    .name('Saved States')
    .onChange((value: string) => {
      if (value) {
        handlers.onLoadState(value);
      }
    });

  const updateSavedStateOptions = (names: string[]) => {
    const options: Record<string, string> = { 'No States': '' };
    names.forEach((name) => {
      options[name] = name;
    });
    savedStateController.options(options);
    savedStateConfig.selected = '';
    savedStateController.setValue('');
  };

  gui
    .add(state, 'animationDuration', 0.05, 1.5, 0.05)
    .name('Transition Smoothness')
    .onChange(emitChange);

  emitChange();

  return {
    gui,
    updateSavedStateOptions,
    applyScaleGraph,
  };
};
