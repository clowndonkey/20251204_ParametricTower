import { Color } from 'three';
import tinycolor from 'tinycolor2';

export const colorFromGradient = (
  startHex: string,
  endHex: string,
  t: number,
): Color => {
  const normalized = Math.min(Math.max(t, 0), 1);
  const start = tinycolor(startHex);
  const end = tinycolor(endHex);
  const interpolated = tinycolor.mix(start, end, normalized * 100);

  const color = new Color();
  color.set(interpolated.toHexString());

  return color;
};
