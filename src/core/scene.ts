import {
  AmbientLight,
  Color,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface SceneBundle {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  controls: OrbitControls;
  updateSize: () => void;
}

const CAMERA_FOV = 45;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000;

export const createScene = (container: HTMLElement): SceneBundle => {
  const scene = new Scene();
  scene.background = new Color('#04070a');

  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const camera = new PerspectiveCamera(
    CAMERA_FOV,
    container.clientWidth / container.clientHeight,
    CAMERA_NEAR,
    CAMERA_FAR,
  );
  camera.position.set(10, 15, 22);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const ambient = new AmbientLight('#ffffff', 0.4);
  scene.add(ambient);

  const fillLight = new DirectionalLight('#f8f0e3', 1.1);
  fillLight.position.set(12, 25, 18);
  scene.add(fillLight);

  const rimLight = new DirectionalLight('#88aaff', 0.4);
  rimLight.position.set(-8, 15, -12);
  scene.add(rimLight);

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
  };
};
