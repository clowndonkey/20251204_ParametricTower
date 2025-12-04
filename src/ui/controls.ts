import GUI from 'lil-gui';
import { ParamChangeHandler, TowerParameterState } from '../types/params';

export const defaultParams: TowerParameterState = {
  floorCount: 32,
  floorHeight: 0.8,
  floorThickness: 0.4,
  baseRadius: 2.5,
  twistMin: 0,
  twistMax: 320,
  scaleMin: 0.7,
  scaleMax: 1.2,
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

  gui.add(state, 'floorCount', 3, 80, 1).name('Floors').onChange(emitChange);
  gui
    .add(state, 'floorHeight', 0.4, 2, 0.05)
    .name('Floor Height')
    .onChange(emitChange);
  gui
    .add(state, 'floorThickness', 0.1, 1, 0.05)
    .name('Slab Thickness')
    .onChange(emitChange);
  gui
    .add(state, 'baseRadius', 1, 6, 0.1)
    .name('Base Radius')
    .onChange(emitChange);
  gui.add(state, 'twistMin', -360, 360, 1).name('Twist Min').onChange(() => {
    if (state.twistMin > state.twistMax) {
      state.twistMax = state.twistMin;
    }
    emitChange();
  });
  gui.add(state, 'twistMax', -360, 720, 1).name('Twist Max').onChange(() => {
    if (state.twistMax < state.twistMin) {
      state.twistMin = state.twistMax;
    }
    emitChange();
  });
  gui
    .add(state, 'scaleMin', 0.3, 2, 0.01)
    .name('Scale Min')
    .onChange(() => {
      if (state.scaleMin > state.scaleMax) {
        state.scaleMax = state.scaleMin;
      }
      emitChange();
    });
  gui
    .add(state, 'scaleMax', 0.3, 3, 0.01)
    .name('Scale Max')
    .onChange(() => {
      if (state.scaleMax < state.scaleMin) {
        state.scaleMin = state.scaleMax;
      }
      emitChange();
    });
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
