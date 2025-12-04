export interface TowerParameterState {
  floorCount: number;
  floorHeight: number;
  floorThickness: number;
  baseRadius: number;
  twistMin: number;
  twistMax: number;
  scaleMin: number;
  scaleMax: number;
  gradientStart: string;
  gradientEnd: string;
  animationDuration: number;
}

export type ParamChangeHandler = (next: TowerParameterState) => void;
