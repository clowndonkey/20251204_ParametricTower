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
import { TowerParameterState } from '../types/params';

const createBaseShape = (radius: number): Shape => {
  const shape = new Shape();
  const points: Vector2[] = [];
  const segments = 32;

  for (let i = 0; i <= segments; i += 1) {
    const theta = (i / segments) * Math.PI * 2;
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
): ExtrudeGeometry => {
  const shape = createBaseShape(radius);
  return new ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
    steps: 1,
  });
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

export const buildTower = (params: TowerParameterState): Group => {
  const tower = new Group();
  tower.name = 'TowerGroup';

  const material = new MeshStandardMaterial({
    vertexColors: true,
    flatShading: true,
    roughness: 0.65,
    metalness: 0.05,
  });

  const floorCount = Math.max(1, Math.round(params.floorCount));
  const floorHeight = Math.max(0.1, params.floorHeight);
  const baseRadius = Math.max(0.2, params.baseRadius);
  const thickness = Math.max(0.05, params.floorThickness);

  for (let i = 0; i < floorCount; i += 1) {
    const progress = floorCount > 1 ? i / (floorCount - 1) : 0;

    const geometry = createFloorGeometry(baseRadius, thickness);

    const color = colorFromGradient(
      params.gradientStart,
      params.gradientEnd,
      progress,
    );

    applyVertexColor(geometry, color.r, color.g, color.b);

    const mesh = new Mesh(geometry, material);
    mesh.position.y = i * floorHeight;
    mesh.rotation.y = MathUtils.degToRad(
      MathUtils.lerp(params.twistMin, params.twistMax, progress),
    );

    const scaleFactor = MathUtils.lerp(
      params.scaleMin,
      params.scaleMax,
      progress,
    );
    mesh.scale.set(scaleFactor, 1, scaleFactor);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    tower.add(mesh);
  }

  tower.position.y = thickness * 0.5;

  return tower;
};
