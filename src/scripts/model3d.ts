// Escultura en 3D real (.glb) para el Hero.
// Intro: partículas con los colores de la pieza se juntan desde el espacio mientras la escultura gira hasta quedar
// de frente; luego se mece, sigue al cursor y se puede girar 360° arrastrando.
import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  type Material,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export interface ModelOptions {
  src: string; // .glb comprimido con meshopt
  frontYaw?: number; // giro (rad) para que el frente del modelo mire a la cámara
  height?: number; // alto en unidades de la escena (la cámara ve ~4)
  ground?: number; // altura de la base del modelo, como fracción del alto (0 = lo más bajo); ahí va la sombra
}

const PARTICLES = 7000;
const SHADOW_OPACITY = 0.75;

const INTRO = { gather: 1.6, spread: 0.6, meshIn: [1.5, 2.5], dustOut: [2.1, 3], turn: [0, 2.8] } as const;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeOut = (n: number) => 1 - Math.pow(1 - n, 3);
const range = (t: number, [a, b]: readonly [number, number]) => clamp01((t - a) / (b - a));

// Lee los píxeles de la textura para dar a cada partícula el color de la pieza
function texturePixels(image: CanvasImageSource & { width: number; height: number }) {
  const c = document.createElement('canvas');
  c.width = Math.min(image.width, 512);
  c.height = Math.min(image.height, 512);
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(image, 0, 0, c.width, c.height);
  return { data: ctx.getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height };
}

export async function mountModel(
  stage: HTMLElement,
  { src, frontYaw = 0, height: HEIGHT = 3, ground = 0 }: ModelOptions
) {
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(src);

  let mesh: Mesh | undefined;
  gltf.scene.traverse((o) => {
    if (!mesh && (o as Mesh).isMesh) mesh = o as Mesh;
  });
  if (!mesh) throw new Error('El modelo no tiene malla');

  // Centrar y escalar al alto deseado
  const model = gltf.scene;
  model.rotation.y = frontYaw;
  model.updateMatrixWorld(true);
  const box = new Box3().setFromObject(model);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const scale = HEIGHT / size.y;
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  model.updateMatrixWorld(true);

  // Sombra de contacto bajo la base: centro y tamaño a partir de los vértices de la franja de la base
  // (así no cuenta lo que cuelga por debajo ni los brazos)
  const groundY = -HEIGHT / 2 + HEIGHT * ground;
  const footprint = new Box3();
  const v = new Vector3();
  const posAttr = mesh.geometry.getAttribute('position');
  for (let i = 0; i < posAttr.count; i++) {
    v.fromBufferAttribute(posAttr, i).applyMatrix4(mesh.matrixWorld);
    if (v.y >= groundY && v.y < groundY + HEIGHT * 0.06) footprint.expandByPoint(v);
  }
  if (footprint.isEmpty()) footprint.setFromCenterAndSize(new Vector3(0, groundY, 0), new Vector3(1, 0, 1));
  const shadowTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.45, 'rgba(0,0,0,0.55)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new CanvasTexture(c);
  })();
  const shadowMat = new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0 });
  const shadow = new Mesh(new PlaneGeometry(1, 1), shadowMat);
  const fp = footprint.getSize(new Vector3());
  const fc = footprint.getCenter(new Vector3());
  // Óvalo de cara a la cámara (como una sombra pintada en el piso del escenario), fijo bajo la base:
  // la cámara está casi a la altura de la base y una sombra acostada se vería de canto.
  const shadowW = Math.max(fp.x, fp.z) * 2.4;
  shadow.scale.set(shadowW, shadowW * 0.16, 1);
  shadow.position.set(fc.x, groundY, fc.z - Math.max(fp.x, fp.z) * 0.3);

  const materials = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as (Material & {
    map?: { image?: CanvasImageSource & { width: number; height: number } };
    metalness?: number;
    roughness?: number;
    metalnessMap?: unknown;
  })[];
  for (const m of materials) {
    m.transparent = true;
    m.opacity = 0;
    // Sin mapa de metal/rugosidad (escaneos): pátina con algo de brillo, sin volverse espejo
    if (!m.metalnessMap && m.metalness !== undefined) {
      m.metalness = 0.35;
      m.roughness = 0.5;
    }
  }

  // Partículas: puntos sobre la superficie de la pieza, con el color de su textura
  const sampler = new MeshSurfaceSampler(mesh).build();
  const tex = materials[0].map?.image ? texturePixels(materials[0].map.image) : null;
  const target = new Float32Array(PARTICLES * 3);
  const start = new Float32Array(PARTICLES * 3);
  const colors = new Float32Array(PARTICLES * 3);
  const delay = new Float32Array(PARTICLES);
  const p = new Vector3();
  const n = new Vector3();
  const col = new Color();
  const uv = new Vector2();
  for (let i = 0; i < PARTICLES; i++) {
    sampler.sample(p, n, col, uv);
    p.applyMatrix4(mesh.matrixWorld);
    target.set([p.x, p.y, p.z], i * 3);
    if (tex) {
      const x = Math.min(tex.w - 1, Math.max(0, Math.floor(uv.x * tex.w)));
      const y = Math.min(tex.h - 1, Math.max(0, Math.floor(uv.y * tex.h)));
      const k = (y * tex.w + x) * 4;
      // un poco más claro que la textura para que el polvo se lea sobre el fondo oscuro
      for (let c = 0; c < 3; c++) colors[i * 3 + c] = Math.min(1, Math.pow(tex.data[k + c] / 255, 2.2) * 1.8 + 0.04);
    } else {
      colors.set([0.9, 0.85, 0.75], i * 3);
    }

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 3 + Math.random() * 4;
    start.set([r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)], i * 3);
    delay[i] = Math.random() * INTRO.spread;
  }
  const dustGeo = new BufferGeometry();
  const dustPos = new BufferAttribute(start.slice(), 3);
  dustGeo.setAttribute('position', dustPos);
  dustGeo.setAttribute('color', new BufferAttribute(colors, 3));
  const dustMat = new PointsMaterial({ size: 0.022, vertexColors: true, transparent: true, depthWrite: false });
  const dust = new Points(dustGeo, dustMat);

  const group = new Group();
  group.add(model, dust);

  // Escena: luz cálida principal, contraluz laca y relleno resina (los colores de la marca)
  const scene = new Scene();
  scene.add(group, shadow);
  scene.add(new HemisphereLight(0xf3f1ea, 0x0f0e0d, 1.2));
  const key = new DirectionalLight(0xfff1dd, 2.2);
  key.position.set(-3, 4, 5);
  const rim = new DirectionalLight(0xc8452c, 3.5);
  rim.position.set(5, 1, -2);
  const fill = new DirectionalLight(0xd9a441, 1);
  fill.position.set(-4, -1, 2);
  scene.add(key, rim, fill);

  const camera = new PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 7.6);

  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  stage.appendChild(renderer.domElement);

  // El canvas es más grande que el recuadro de la escultura (CSS), para que al girar no se corten
  // brazos ni puntas. La cámara se aleja en la misma proporción y la pieza conserva su tamaño.
  const STAGE_DISTANCE = 7.6;
  const resize = () => {
    const stageH = stage.getBoundingClientRect().height;
    const width = renderer.domElement.clientWidth;
    const height = renderer.domElement.clientHeight;
    if (!width || !height || !stageH) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = STAGE_DISTANCE * (height / stageH);
    camera.updateProjectionMatrix();
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

  // Arrastrar para girar 360°; al soltar sigue por inercia y vuelve de frente.
  // Es una acción del usuario, así que funciona también con movimiento reducido.
  const TURN = Math.PI * 2;
  const drag = { active: false, lastX: 0, spin: 0, vel: 0 };
  // Se arrastra sobre el recuadro de la escultura; el canvas no recibe clics para no tapar el texto.
  stage.addEventListener('pointerdown', (e) => {
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

  const t0 = performance.now();
  let introDone = false;

  const finishIntro = () => {
    introDone = true;
    group.remove(dust);
    dustGeo.dispose();
    dustMat.dispose();
    for (const m of materials) {
      m.opacity = 1;
      m.transparent = false;
      m.needsUpdate = true;
    }
    shadowMat.opacity = SHADOW_OPACITY;
  };

  const frame = (now: number) => {
    const t = (now - t0) / 1000;

    if (!introDone) {
      const arr = dustPos.array as Float32Array;
      for (let i = 0; i < PARTICLES; i++) {
        const k = easeOut(clamp01((t - delay[i]) / INTRO.gather));
        for (let a = 0; a < 3; a++) {
          const j = i * 3 + a;
          arr[j] = start[j] + (target[j] - start[j]) * k;
        }
        arr[i * 3] += Math.sin(t * 2 + i) * (1 - k) * 0.8;
      }
      dustPos.needsUpdate = true;
      for (const m of materials) m.opacity = range(t, INTRO.meshIn);
      shadowMat.opacity = SHADOW_OPACITY * range(t, INTRO.meshIn);
      dustMat.opacity = 1 - range(t, INTRO.dustOut);
      group.scale.setScalar(0.94 + 0.06 * easeOut(range(t, INTRO.meshIn)));
      if (t > INTRO.dustOut[1]) finishIntro();
    }

    if (!drag.active) {
      drag.spin += drag.vel;
      drag.vel *= 0.94;
      if (Math.abs(drag.vel) < 0.002) drag.spin += (Math.round(drag.spin / TURN) * TURN - drag.spin) * 0.04;
    }

    // Giro de entrada (de espaldas a de frente), vaivén continuo, cursor y arrastre.
    // Con movimiento reducido: sin entrada ni flotación, y un vaivén más lento y corto.
    const auto = reduced ? 0 : 1;
    const entrance = -Math.PI * (1 - easeOut(range(t, INTRO.turn))) * auto;
    const sway = reduced ? Math.sin(t * 0.3) * 0.3 : Math.sin(t * 0.45) * 0.55;
    group.rotation.y += (entrance + sway + pointer.x * 0.3 + drag.spin - group.rotation.y) * 0.08;
    group.rotation.x += (Math.sin(t * 0.3) * 0.05 * auto + pointer.y * 0.12 - group.rotation.x) * 0.05;
    group.position.y = Math.sin(t * 0.7) * 0.06 * auto;

    renderer.render(scene, camera);
  };

  if (reduced) finishIntro();
  new ResizeObserver(resize).observe(stage);
  // Solo renderiza mientras el Hero está en pantalla
  let visible = true;
  const sync = () => renderer.setAnimationLoop(visible && !document.hidden ? frame : null);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(stage);
  document.addEventListener('visibilitychange', sync);
  frame(performance.now());

  stage.classList.add('is-3d');
}
