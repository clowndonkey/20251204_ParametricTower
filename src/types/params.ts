export interface BezierGraphState {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

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
  useScaleGraph: boolean;
  scaleGraph: BezierGraphState;
  scaleCurve: GradientCurve;
  gradientStart: string;
  gradientEnd: string;
  animationDuration: number;
  autoSpin: boolean;
  spinDegrees: number;
  backgroundColor: string;
  enableShadows: boolean;
  ambientIntensity: number;
}

export type ParamChangeHandler = (next: TowerParameterState) => void;

export type GradientCurve =
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad';
