// Visor 3D de la Sala: muestra un .glb dentro de un contenedor, se gira arrastrando (y con zoom).
// Se importa solo cuando alguien abre una obra; un único renderer se reutiliza entre obras.
import {
  Box3,
  DirectionalLight,
  type Group,
  HemisphereLight,
  type Mesh,
  type MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const RADIUS = 1.05; // radio de la esfera que envuelve la pieza: cabe entera al girarla, sea alta o ancha
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const cache = new Map<string, Promise<Group>>();

function load(src: string) {
  if (!cache.has(src)) {
    cache.set(
      src,
      loader.loadAsync(src).then((gltf) => {
        const model = gltf.scene;
        const box = new Box3().setFromObject(model);
        const size = box.getSize(new Vector3());
        const center = box.getCenter(new Vector3());
        const s = RADIUS / (size.length() / 2);
        model.scale.setScalar(s);
        model.position.set(-center.x * s, -center.y * s, -center.z * s);
        model.traverse((o) => {
          const m = o as Mesh;
          if (!m.isMesh) return;
          const mat = m.material as MeshStandardMaterial;
          // Modelos sin mapa de metal/rugosidad: pátina con algo de brillo
          if (mat && !mat.metalnessMap && mat.metalness !== undefined) {
            mat.metalness = 0.35;
            mat.roughness = 0.5;
          }
        });
        return model;
      })
    );
  }
  return cache.get(src)!;
}

let viewer: ReturnType<typeof createViewer> | null = null;

function createViewer() {
  const scene = new Scene();
  scene.add(new HemisphereLight(0xfaf9f6, 0x0c0a09, 1.2));
  const key = new DirectionalLight(0xfff1dd, 2.4);
  key.position.set(-3, 4, 5);
  const rim = new DirectionalLight(0xca8a04, 2.6);
  rim.position.set(4, 2, -3);
  const fill = new DirectionalLight(0xb98a5a, 0.8);
  fill.position.set(-4, -1, 2);
  scene.add(key, rim, fill);

  const camera = new PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0.2, 4.8);
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.minDistance = 2.6;
  controls.maxDistance = 8;
  controls.autoRotateSpeed = 1.2;
  // Al tocar la pieza se detiene el giro automático
  controls.addEventListener('start', () => (controls.autoRotate = false));

  let current: Group | null = null;
  let host: HTMLElement | null = null;
  let observer: ResizeObserver | null = null;

  const resize = () => {
    if (!host) return;
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  return {
    async show(container: HTMLElement, src: string) {
      const model = await load(src);
      if (current) scene.remove(current);
      current = model;
      scene.add(model);
      host = container;
      container.appendChild(renderer.domElement);
      observer?.disconnect();
      observer = new ResizeObserver(resize);
      observer.observe(container);
      resize();
      camera.position.set(0, 0.2, 4.8);
      controls.target.set(0, 0, 0);
      controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      controls.update();
      renderer.setAnimationLoop(() => {
        controls.update();
        renderer.render(scene, camera);
      });
    },
    stop() {
      renderer.setAnimationLoop(null);
      observer?.disconnect();
      renderer.domElement.remove();
    },
  };
}

export async function showModel(container: HTMLElement, src: string) {
  viewer ??= createViewer();
  await viewer.show(container, src);
}

export function stopViewer() {
  viewer?.stop();
}
