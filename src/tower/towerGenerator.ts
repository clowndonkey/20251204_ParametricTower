import {
  BufferAttribute,
  ExtrudeGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Shape,
  Vector2,
} from 'three';
import { colorFromGradient } from '../utils/colorGradient';
import type { TowerParameterState } from '../types/params';
import { applyCurve } from '../utils/curve';
import { evaluateBezier } from '../utils/bezier';

const createBaseShape = (radius: number, segments: number): Shape => {
  const shape = new Shape();
  const points: Vector2[] = [];
  const clampedSegments = Math.max(3, Math.floor(segments));

  for (let i = 0; i <= clampedSegments; i += 1) {
    const theta = (i / clampedSegments) * Math.PI * 2;
    const x = Math.cos(theta) * radius;
    const y = Math.sin(theta) * radius;
    points.push(new Vector2(x, y));
  }

  shape.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((pt) => shape.lineTo(pt.x, pt.y));

  return shape;
};

const createFloorGeometry = (
  radius: number,
  thickness: number,
  segments: number,
): ExtrudeGeometry => {
  const shape = createBaseShape(radius, segments);
  const geometry = new ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
    steps: 1,
  });

  geometry.rotateX(Math.PI / 2);
  geometry.translate(0, thickness / 2, 0);

  return geometry;
};

const applyVertexColor = (
  geometry: ExtrudeGeometry,
  r: number,
  g: number,
  b: number,
) => {
  const vertexCount = geometry.attributes.position.count;
  const colors = new Float32Array(vertexCount * 3);

  for (let i = 0; i < vertexCount; i += 1) {
    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
  }

  geometry.setAttribute('color', new BufferAttribute(colors, 3));
};

const normalizeGraphState = (graph: TowerParameterState['scaleGraph']) => ({
  ...graph,
  startY: graph.startY ?? 0,
  endY: graph.endY ?? 1,
});

export const buildTower = (params: TowerParameterState): Group => {
  const tower = new Group();
  tower.name = 'TowerGroup';

  const material = new MeshStandardMaterial({
    vertexColors: true,
    flatShading: true,
    roughness: 0.65,
    metalness: 0.05,
  });

  const floorCount = Math.max(0, Math.round(params.floorCount));
  const floorHeight = Math.max(0, params.floorHeight);
  const baseRadius = Math.max(0, params.baseRadius);
  const thickness = Math.max(0, params.floorThickness);

  for (let i = 0; i < floorCount; i += 1) {
    const progress = floorCount > 1 ? i / (floorCount - 1) : 0;

    const geometry = createFloorGeometry(baseRadius, thickness, params.sides);

    const color = colorFromGradient(
      params.gradientStart,
      params.gradientEnd,
      progress,
    );

    applyVertexColor(geometry, color.r, color.g, color.b);

    const mesh = new Mesh(geometry, material);
    mesh.position.y = i * floorHeight;
    const twistProgress = applyCurve(progress, params.twistCurve);
    mesh.rotation.y = MathUtils.degToRad(
      MathUtils.lerp(params.twistMin, params.twistMax, twistProgress),
    );

    const scaleProgress = params.useScaleGraph
      ? evaluateBezier(progress, normalizeGraphState(params.scaleGraph))
      : applyCurve(progress, params.scaleCurve);
    const scaleFactor = MathUtils.lerp(
      params.scaleMin,
      params.scaleMax,
      scaleProgress,
    );
    mesh.scale.set(scaleFactor, 1, scaleFactor);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    tower.add(mesh);
  }

  tower.position.y = thickness * 0.5;

  return tower;
};
