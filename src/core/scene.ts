import {
  AmbientLight,
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
  PCFSoftShadowMap,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface SceneBundle {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  controls: OrbitControls;
  updateSize: () => void;
  ambientLight: AmbientLight;
  ground: Mesh;
}

const CAMERA_FOV = 45;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000;

export const createScene = (container: HTMLElement): SceneBundle => {
  const scene = new Scene();
  scene.background = new Color('#04070a');

  const renderer = new WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const camera = new PerspectiveCamera(
    CAMERA_FOV,
    container.clientWidth / container.clientHeight,
    CAMERA_NEAR,
    CAMERA_FAR,
  );
  camera.position.set(10, 12, 22);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const ambient = new AmbientLight('#ffffff', 0.4);
  scene.add(ambient);

  const fillLight = new DirectionalLight('#f8f0e3', 1.5);
  fillLight.position.set(25, 35, 20);
  fillLight.castShadow = true;
  fillLight.shadow.mapSize.set(2048, 2048);
  fillLight.shadow.camera.near = 1;
  fillLight.shadow.camera.far = 120;
  fillLight.shadow.camera.left = -60;
  fillLight.shadow.camera.right = 60;
  fillLight.shadow.camera.top = 60;
  fillLight.shadow.camera.bottom = -60;
  fillLight.shadow.bias = -0.0005;
  fillLight.target.position.set(0, 0, 0);
  scene.add(fillLight.target);
  scene.add(fillLight);

  const rimLight = new DirectionalLight('#88aaff', 0.5);
  rimLight.position.set(-15, 20, -10);
  rimLight.castShadow = false;
  scene.add(rimLight);

  const groundGeometry = new PlaneGeometry(20000, 20000);
  const groundMaterial = new MeshStandardMaterial({
    color: '#202020',
    roughness: 0.9,
    metalness: 0.1,
  });
  const ground = new Mesh(groundGeometry, groundMaterial);
  ground.rotateX(-Math.PI / 2);
  ground.receiveShadow = true;
  ground.position.y = -0.01;
  scene.add(ground);

  const gridGeometry = new PlaneGeometry(4000, 4000, 1, 1);
  const gridMaterial = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uGridColor: { value: new Color('#d5d8df') },
      uSubGridColor: { value: new Color('#eff1f6') },
      uScale: { value: 10 },
      uSubDivisions: { value: 10 },
      uFadeDistance: { value: 1200 },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vWorldPosition;
      uniform vec3 uGridColor;
      uniform vec3 uSubGridColor;
      uniform float uScale;
      uniform float uSubDivisions;
      uniform float uFadeDistance;

      float gridLines(vec2 coord) {
        vec2 grid = abs(fract(coord) - 0.5) / fwidth(coord);
        float line = min(grid.x, grid.y);
        return 1.0 - clamp(line, 0.0, 1.0);
      }

      void main() {
        vec2 worldCoord = vWorldPosition.xz;
        vec2 majorCoord = worldCoord / uScale;
        float major = gridLines(majorCoord);

        float subScale = uScale / uSubDivisions;
        vec2 minorCoord = (worldCoord - vec2(0.5)) / subScale;
        float minor = gridLines(minorCoord);

        float fade = 1.0 - smoothstep(80.0, uFadeDistance, length(worldCoord));
        float majorAlpha = major * fade * 0.9;
        float minorAlpha = minor * fade * 0.35;

        vec3 color = mix(uSubGridColor, uGridColor, majorAlpha);
        float alpha = max(majorAlpha, minorAlpha);

        if (minorAlpha > majorAlpha) {
          color = mix(uSubGridColor, uGridColor, 0.3);
        }

        if (alpha <= 0.01) discard;

        gl_FragColor = vec4(color, alpha);
      }
    `,
  });
  const gridMesh = new Mesh(gridGeometry, gridMaterial);
  gridMesh.rotateX(-Math.PI / 2);
  gridMesh.position.y = ground.position.y + 0.1;
  scene.add(gridMesh);

  const updateSize = () => {
    const { clientWidth, clientHeight } = container;
    renderer.setSize(clientWidth, clientHeight);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  };

  window.addEventListener('resize', updateSize);

  return {
    scene,
    camera,
    renderer,
    controls,
    updateSize,
    ambientLight: ambient,
    ground,
  };
};
