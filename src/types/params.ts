export interface TowerParameterState {
  floorCount: number;
  floorHeight: number;
  floorThickness: number;
  baseRadius: number;
  sides: number;
  twistMin: number;
  twistMax: number;
  twistCurve: GradientCurve;
  scaleMin: number;
  scaleMax: number;
  scaleCurve: GradientCurve;
  gradientStart: string;
  gradientEnd: string;
  animationDuration: number;
}

export type ParamChangeHandler = (next: TowerParameterState) => void;

export type GradientCurve =
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad';
