import { BufferGeometry, Group, Mesh, Object3D } from 'three';

const formatNumber = (value: number) => Number(value).toFixed(6);

const cloneGeometryWithWorldMatrix = (
  mesh: Mesh,
): BufferGeometry | null => {
  const base = mesh.geometry;

  if (!base || !(base instanceof BufferGeometry)) {
    return null;
  }

  const clone = base.clone();
  clone.applyMatrix4(mesh.matrixWorld);
  return clone;
};

export const exportTowerToOBJ = (tower: Group): string => {
  const lines: string[] = [
    '# Parametric Tower OBJ',
    '# Vertex color data stored as r g b appended to each vertex line',
  ];
  let vertexOffset = 0;

  tower.updateMatrixWorld(true);

  const meshes: Mesh[] = [];

  tower.traverse((child: Object3D) => {
    if (child instanceof Mesh) {
      meshes.push(child);
    }
  });

  meshes.forEach((mesh, meshIndex) => {
    const geometry = cloneGeometryWithWorldMatrix(mesh);
    if (!geometry) {
      return;
    }

    const buffer = geometry.index ? geometry.toNonIndexed() : geometry;
    const positions = buffer.getAttribute('position');
    if (!positions) {
      return;
    }

    const colors = buffer.getAttribute('color');
    lines.push(`o Floor_${meshIndex}`);

    for (let i = 0; i < positions.count; i += 1) {
      const x = formatNumber(positions.getX(i));
      const y = formatNumber(positions.getY(i));
      const z = formatNumber(positions.getZ(i));

      const r = colors ? formatNumber(colors.getX(i)) : '1.000000';
      const g = colors ? formatNumber(colors.getY(i)) : '1.000000';
      const b = colors ? formatNumber(colors.getZ(i)) : '1.000000';

      lines.push(`v ${x} ${y} ${z} ${r} ${g} ${b}`);
    }

    const vertexCount = positions.count;

    for (let i = 0; i < vertexCount; i += 3) {
      const a = vertexOffset + i + 1;
      const b = vertexOffset + i + 2;
      const c = vertexOffset + i + 3;
      lines.push(`f ${a} ${b} ${c}`);
    }

    vertexOffset += vertexCount;
  });

  return `${lines.join('\n')}\n`;
};
