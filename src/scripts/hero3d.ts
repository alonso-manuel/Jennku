// Escena 3D del Hero en un canvas que cubre toda la sección.
// Coreografía: la escultura sube desde abajo al centro (con ENFiBRART detrás, en el HTML), hace una pausa,
// se desplaza a su lugar (el recuadro [data-sculpture]) y recién entonces entra el texto.
// Después se mece, sigue al cursor y se puede girar arrastrando.
import {
  Box3,
  CanvasTexture,
  DirectionalLight,
  Group,
  HemisphereLight,
  type Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export interface HeroOptions {
  hero: HTMLElement; // la sección; el canvas la cubre entera
  stage: HTMLElement; // recuadro donde termina la escultura (y donde se arrastra)
  main: { src: string; height: number; ground?: number; frontYaw?: number };
  onPhase?: (phase: 'rise' | 'settle' | 'text') => void;
}

// Tiempos de la coreografía, en segundos desde que carga el modelo
const T = {
  rise: [0, 1.5],
  move: [2.4, 3.7],
  text: 3.0,
} as const;

const STAGE_UNITS = 4.07; // unidades de escena que entran en el alto del recuadro
const SHADOW_OPACITY = 0.75;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeOut = (n: number) => 1 - Math.pow(1 - n, 3);
const easeInOut = (n: number) => (n < 0.5 ? 4 * n * n * n : 1 - Math.pow(-2 * n + 2, 3) / 2);
const range = (t: number, [a, b]: readonly [number, number]) => clamp01((t - a) / (b - a));

type FadeMaterial = Material & { opacity: number; transparent: boolean };

function setOpacity(mats: FadeMaterial[], o: number) {
  for (const m of mats) {
    const solid = o >= 1;
    if (m.transparent === solid) {
      m.transparent = !solid;
      m.needsUpdate = true;
    }
    m.opacity = o;
  }
}

async function loadModel(src: string, height: number, frontYaw = 0) {
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(src);
  const model = gltf.scene;
  model.rotation.y = frontYaw;
  model.updateMatrixWorld(true);
  const box = new Box3().setFromObject(model);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const s = height / size.y;
  model.scale.setScalar(s);
  model.position.set(-center.x * s, -center.y * s, -center.z * s);
  model.updateMatrixWorld(true);

  const mats: FadeMaterial[] = [];
  let mesh: Mesh | undefined;
  model.traverse((o) => {
    const m = o as Mesh;
    if (!m.isMesh) return;
    mesh ??= m;
    for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
      const std = mat as MeshStandardMaterial;
      // Escaneos sin mapa de metal/rugosidad: pátina con algo de brillo
      if (!std.metalnessMap && std.metalness !== undefined) {
        std.metalness = 0.35;
        std.roughness = 0.5;
      }
      mats.push(mat as FadeMaterial);
    }
  });
  const group = new Group();
  group.add(model);
  return { group, mats, mesh: mesh! };
}

// Sombra de contacto bajo la base del modelo (óvalo de cara a la cámara)
function contactShadow(mesh: Mesh, height: number, ground: number) {
  const groundY = -height / 2 + height * ground;
  const footprint = new Box3();
  const v = new Vector3();
  const pos = mesh.geometry.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
    if (v.y >= groundY && v.y < groundY + height * 0.06) footprint.expandByPoint(v);
  }
  if (footprint.isEmpty()) footprint.setFromCenterAndSize(new Vector3(0, groundY, 0), new Vector3(1, 0, 1));
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,1)');
  g.addColorStop(0.45, 'rgba(0,0,0,0.55)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const mat = new MeshBasicMaterial({ map: new CanvasTexture(c), transparent: true, depthWrite: false, opacity: 0 });
  const shadow = new Mesh(new PlaneGeometry(1, 1), mat);
  const fp = footprint.getSize(new Vector3());
  const fc = footprint.getCenter(new Vector3());
  const w = Math.max(fp.x, fp.z) * 2.4;
  shadow.scale.set(w, w * 0.16, 1);
  shadow.position.set(fc.x, groundY, fc.z - Math.max(fp.x, fp.z) * 0.3);
  return { shadow, mat };
}

export async function mountHero(opts: HeroOptions) {
  const { hero, stage } = opts;
  const main = await loadModel(opts.main.src, opts.main.height, opts.main.frontYaw);
  const { shadow, mat: shadowMat } = contactShadow(main.mesh, opts.main.height, opts.main.ground ?? 0);

  const scene = new Scene();
  const rig = new Group(); // posición en pantalla (centro → recuadro)
  const spin = new Group(); // giro, vaivén y arrastre
  spin.add(main.group);
  rig.add(spin, shadow);
  scene.add(rig);

  // Luces: cálida principal, contraluz dorado y relleno bronce
  scene.add(new HemisphereLight(0xfaf9f6, 0x0c0a09, 1.1));
  const key = new DirectionalLight(0xfff1dd, 2.3);
  key.position.set(-3, 4, 5);
  const rim = new DirectionalLight(0xca8a04, 3.4);
  rim.position.set(5, 1, -2);
  const fill = new DirectionalLight(0xb98a5a, 0.9);
  fill.position.set(-4, -1, 2);
  scene.add(key, rim, fill);

  const camera = new PerspectiveCamera(30, 1, 0.1, 100);
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const canvas = renderer.domElement;
  canvas.className = 'hero-canvas';
  hero.prepend(canvas);

  // Encuadre: la escala (px por unidad) sale del recuadro, para que la escultura mida lo mismo en cualquier
  // pantalla. "target" es el centro del recuadro en coordenadas de escena.
  const view = { target: new Vector3(), visibleH: 8 };
  const resize = () => {
    const h = hero.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    if (!h.width || !h.height || !s.height) return;
    renderer.setSize(h.width, h.height, false);
    const pxPerUnit = s.height / STAGE_UNITS;
    view.visibleH = h.height / pxPerUnit;
    camera.aspect = h.width / h.height;
    camera.position.set(0, 0, view.visibleH / 2 / Math.tan((15 * Math.PI) / 180));
    camera.updateProjectionMatrix();
    view.target.set(
      (s.left + s.width / 2 - (h.left + h.width / 2)) / pxPerUnit,
      -(s.top + s.height / 2 - (h.top + h.height / 2)) / pxPerUnit,
      0
    );
  };
  resize();

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Inclinación según el cursor
  const pointer = { x: 0, y: 0 };
  if (!reduced) {
    window.addEventListener(
      'pointermove',
      (e) => {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      },
      { passive: true }
    );
  }

  // Arrastre sobre el recuadro (solo cuando la escultura ya está ahí)
  const TURN = Math.PI * 2;
  const drag = { active: false, lastX: 0, spin: 0, vel: 0, enabled: false };
  stage.addEventListener('pointerdown', (e) => {
    if (!drag.enabled) return;
    drag.active = true;
    drag.lastX = e.clientX;
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag.active) return;
    drag.vel = (e.clientX - drag.lastX) * 0.012;
    drag.spin += drag.vel;
    drag.lastX = e.clientX;
  });
  const release = () => (drag.active = false);
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);

  const fired = new Set<string>();
  const fire = (p: 'rise' | 'settle' | 'text') => {
    if (fired.has(p)) return;
    fired.add(p);
    opts.onPhase?.(p);
  };

  let t0 = performance.now();

  const frame = (now: number) => {
    // La coreografía se reproduce siempre (es el contenido del Hero); con movimiento reducido
    // solo el vaivén posterior es más lento y corto, y no hay flotación
    const t = (now - t0) / 1000;

    // Sube desde abajo hasta el centro y después se desplaza a su recuadro
    const rise = easeOut(range(t, T.rise));
    const startY = -view.visibleH / 2 - opts.main.height;
    const move = easeInOut(range(t, T.move));
    rig.position.set(view.target.x * move, startY + (0 - startY) * rise + view.target.y * move, 0);
    setOpacity(main.mats, clamp01(rise * 1.6));
    shadowMat.opacity = SHADOW_OPACITY * rise;

    if (t >= T.rise[0]) fire('rise');
    if (t >= T.move[0]) fire('settle');
    if (t >= T.text) fire('text');
    if (t >= T.move[1]) drag.enabled = true;

    // Arrastre con inercia; vuelve de frente
    if (!drag.active) {
      drag.spin += drag.vel;
      drag.vel *= 0.94;
      if (Math.abs(drag.vel) < 0.002) drag.spin += (Math.round(drag.spin / TURN) * TURN - drag.spin) * 0.04;
    }

    // Giro al subir, luego vaivén, cursor y arrastre
    const settled = range(t, T.move);
    const entrance = -0.7 * (1 - rise);
    const sway = (reduced ? Math.sin(t * 0.3) * 0.3 : Math.sin(t * 0.45) * 0.5) * settled;
    spin.rotation.y += (entrance + sway + pointer.x * 0.3 * settled + drag.spin - spin.rotation.y) * 0.08;
    spin.rotation.x += (Math.sin(t * 0.3) * 0.05 * settled + pointer.y * 0.12 * settled - spin.rotation.x) * 0.05;
    spin.position.y = reduced ? 0 : Math.sin(t * 0.7) * 0.06 * settled;

    renderer.render(scene, camera);
  };

  new ResizeObserver(resize).observe(hero);
  window.addEventListener('resize', resize);
  // Solo renderiza mientras el Hero está en pantalla
  let visible = true;
  const sync = () => renderer.setAnimationLoop(visible && !document.hidden ? frame : null);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(hero);
  document.addEventListener('visibilitychange', sync);
  t0 = performance.now();
  frame(t0);
  stage.classList.add('is-3d');
}
