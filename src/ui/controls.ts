import GUI from 'lil-gui';
import type {
  GradientCurve,
  ParamChangeHandler,
  TowerParameterState,
} from '../types/params';

const curveOptions: Record<string, GradientCurve> = {
  Linear: 'linear',
  'Ease In Quad': 'easeInQuad',
  'Ease Out Quad': 'easeOutQuad',
  'Ease In/Out Quad': 'easeInOutQuad',
};

export const defaultParams: TowerParameterState = {
  floorCount: 10,
  floorHeight: 3.5,
  floorThickness: 0.25,
  baseRadius: 20,
  sides: 4,
  twistMin: 0,
  twistMax: 0,
  twistCurve: 'easeInOutQuad',
  scaleMin: 1,
  scaleMax: 1,
  scaleCurve: 'easeOutQuad',
  gradientStart: '#0e6ba8',
  gradientEnd: '#f5d547',
  animationDuration: 0.35,
};

export const createControlPanel = (
  initial: TowerParameterState,
  onChange: ParamChangeHandler,
) => {
  const state = { ...initial };
  const gui = new GUI();

  const emitChange = () => onChange({ ...state });

  gui.add(state, 'floorCount', 0, 60, 1).name('Floors').onChange(emitChange);
  gui
    .add(state, 'floorHeight', 0, 20, 0.1)
    .name('Floor Height')
    .onChange(emitChange);
  gui
    .add(state, 'floorThickness', 0, 10, 0.01)
    .name('Slab Thickness')
    .onChange(emitChange);
  gui
    .add(state, 'baseRadius', 0, 100, 0.5)
    .name('Base Radius')
    .onChange(emitChange);
  gui
    .add(state, 'sides', 3, 30, 1)
    .name('Slab Sides')
    .onChange(emitChange);
  gui.add(state, 'twistMin', -360, 360, 1).name('Twist Min').onChange(() => {
    if (state.twistMin > state.twistMax) {
      state.twistMax = state.twistMin;
    }
    emitChange();
  });
  gui.add(state, 'twistMax', -360, 360, 1).name('Twist Max').onChange(() => {
    if (state.twistMax < state.twistMin) {
      state.twistMin = state.twistMax;
    }
    emitChange();
  });
  gui
    .add(state, 'twistCurve', curveOptions)
    .name('Twist Curve')
    .onChange(emitChange);
  gui
    .add(state, 'scaleMin', 0.1, 10, 0.01)
    .name('Scale Min')
    .onChange(() => {
      if (state.scaleMin > state.scaleMax) {
        state.scaleMax = state.scaleMin;
      }
      emitChange();
    });
  gui
    .add(state, 'scaleMax', 0.1, 10, 0.01)
    .name('Scale Max')
    .onChange(() => {
      if (state.scaleMax < state.scaleMin) {
        state.scaleMin = state.scaleMax;
      }
      emitChange();
    });
  gui
    .add(state, 'scaleCurve', curveOptions)
    .name('Scale Curve')
    .onChange(emitChange);
  gui
    .addColor(state, 'gradientStart')
    .name('Gradient Start')
    .onChange(emitChange);
  gui
    .addColor(state, 'gradientEnd')
    .name('Gradient End')
    .onChange(emitChange);
  gui
    .add(state, 'animationDuration', 0.05, 1.5, 0.05)
    .name('Anim Duration')
    .onChange(emitChange);

  emitChange();

  return gui;
};
