// Máscara del logo convertida en relieve 3D para el Hero.
// Intro: partículas de "polvo de resina" que se juntan y forman la máscara; luego aparece la pieza sólida.
import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  SRGBColorSpace,
  Scene,
  WebGLRenderer,
} from 'three';

const HEIGHT = 3.2; // alto de la máscara en unidades de la escena
const SAMPLE_W = 240; // resolución del mapa de alturas
const DOME = 0.6; // profundidad de la curvatura del rostro
const LINE_DEPTH = 0.07; // relieve de las líneas del logo
const PARTICLES = 4500;

const INTRO = { gather: 1.6, spread: 0.6, meshIn: [1.5, 2.5], dustOut: [2.1, 3], turn: [0, 2.8] } as const;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeOut = (n: number) => 1 - Math.pow(1 - n, 3);
const range = (t: number, [a, b]: readonly [number, number]) => clamp01((t - a) / (b - a));

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Desenfoque de caja separable, para que las líneas tengan bordes redondeados en 3D.
function blur(src: Float32Array, w: number, h: number, r: number) {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const size = r * 2 + 1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let k = -r; k <= r; k++) s += src[y * w + Math.min(w - 1, Math.max(0, x + k))];
      tmp[y * w + x] = s / size;
    }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let k = -r; k <= r; k++) s += tmp[Math.min(h - 1, Math.max(0, y + k)) * w + x];
      out[y * w + x] = s / size;
    }
  return out;
}

export async function mountMask(stage: HTMLElement, src: string) {
  const img = await loadImage(src);
  const aspect = img.naturalWidth / img.naturalHeight;
  const W = HEIGHT * aspect;

  // Mapa de alturas a partir del alfa del PNG
  const sw = SAMPLE_W;
  const sh = Math.round(SAMPLE_W / aspect);
  const sc = document.createElement('canvas');
  sc.width = sw;
  sc.height = sh;
  const sctx = sc.getContext('2d', { willReadFrequently: true })!;
  sctx.drawImage(img, 0, 0, sw, sh);
  const data = sctx.getImageData(0, 0, sw, sh).data;
  const alpha = new Float32Array(sw * sh);
  for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3] / 255;
  const lines = blur(blur(alpha, sw, sh, 2), sw, sh, 1);

  const sample = (u: number, v: number) => {
    const x = u * (sw - 1);
    const y = v * (sh - 1);
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const x1 = Math.min(x0 + 1, sw - 1), y1 = Math.min(y0 + 1, sh - 1);
    const fx = x - x0, fy = y - y0;
    const a = lines[y0 * sw + x0] * (1 - fx) + lines[y0 * sw + x1] * fx;
    const b = lines[y1 * sw + x0] * (1 - fx) + lines[y1 * sw + x1] * fx;
    return a * (1 - fy) + b * fy;
  };

  // u, v en 0..1 con v de arriba hacia abajo (coordenadas de la imagen)
  const relief = (u: number, v: number) => {
    const nx = ((u - 0.5) * 2) / 0.985;
    const ny = ((v - 0.5) * 2) / 0.985;
    const e = nx * nx + ny * ny;
    const dome = e < 1 ? Math.sqrt(1 - e) : 0;
    return dome * DOME + sample(u, v) * LINE_DEPTH;
  };

  // Texturas a 3x para bordes nítidos: rostro oscuro con líneas en color hueso, y el recorte en óvalo
  const scale = 3;
  const oval = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, (w / 2) * 0.985, (h / 2) * 0.985, 0, 0, Math.PI * 2);
    ctx.fill();
  };
  const tc = document.createElement('canvas');
  tc.width = img.naturalWidth * scale;
  tc.height = img.naturalHeight * scale;
  const tctx = tc.getContext('2d')!;
  tctx.fillStyle = '#3b2a22';
  oval(tctx, tc.width, tc.height);
  tctx.drawImage(img, 0, 0, tc.width, tc.height);
  const map = new CanvasTexture(tc);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 4;

  const ac = document.createElement('canvas');
  ac.width = tc.width;
  ac.height = tc.height;
  const actx = ac.getContext('2d')!;
  actx.fillStyle = '#fff';
  oval(actx, ac.width, ac.height);
  const alphaMap = new CanvasTexture(ac);

  // Malla en relieve
  const geo = new PlaneGeometry(W, HEIGHT, 160, Math.round(160 / aspect));
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, relief(uv.getX(i), 1 - uv.getY(i)));
  geo.computeVertexNormals();

  // alphaToCoverage + antialias suaviza el borde recortado del óvalo
  const meshMat = new MeshStandardMaterial({
    map,
    alphaTest: 0.5,
    alphaToCoverage: true,
    roughness: 0.55,
    metalness: 0.15,
    transparent: true,
    opacity: 0,
  });
  const mesh = new Mesh(geo, meshMat);

  // Reverso: el interior hueco de la máscara, en resina oscura
  const backMat = new MeshStandardMaterial({
    color: 0x241a15,
    alphaMap,
    alphaTest: 0.5,
    alphaToCoverage: true,
    roughness: 0.85,
    side: BackSide,
    transparent: true,
    opacity: 0,
  });
  const back = new Mesh(geo, backMat);

  // Partículas: posiciones finales sobre las líneas del logo
  const candidates: number[] = [];
  for (let i = 0; i < alpha.length; i++) if (alpha[i] > 0.5) candidates.push(i);
  const target = new Float32Array(PARTICLES * 3);
  const start = new Float32Array(PARTICLES * 3);
  const delay = new Float32Array(PARTICLES);
  for (let p = 0; p < PARTICLES; p++) {
    const idx = candidates[Math.floor(Math.random() * candidates.length)];
    const u = (idx % sw) / (sw - 1);
    const v = Math.floor(idx / sw) / (sh - 1);
    target.set([(u - 0.5) * W, (0.5 - v) * HEIGHT, relief(u, v) + 0.015], p * 3);

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 3 + Math.random() * 4;
    start.set([r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)], p * 3);
    delay[p] = Math.random() * INTRO.spread;
  }
  const dustGeo = new BufferGeometry();
  const dustPos = new BufferAttribute(start.slice(), 3);
  dustGeo.setAttribute('position', dustPos);
  const dustMat = new PointsMaterial({ color: 0xf3f1ea, size: 0.022, transparent: true, depthWrite: false });
  const dust = new Points(dustGeo, dustMat);

  const group = new Group();
  group.add(mesh, back, dust);

  // Escena, luces (hueso, laca y resina) y cámara
  const scene = new Scene();
  scene.add(group);
  scene.add(new HemisphereLight(0xf3f1ea, 0x0f0e0d, 0.6));
  const key = new DirectionalLight(0xfff1dd, 2.4);
  key.position.set(-3, 4, 5);
  const rim = new DirectionalLight(0xc8452c, 3.2);
  rim.position.set(5, 0.5, 0.5);
  const fill = new DirectionalLight(0xd9a441, 0.9);
  fill.position.set(-2, -4, 2);
  scene.add(key, rim, fill);

  const camera = new PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 7.6);

  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  stage.appendChild(renderer.domElement);

  const resize = () => {
    const { width, height } = stage.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
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

  // Arrastrar para girar la pieza; al soltar sigue por inercia y vuelve de frente
  const TURN = Math.PI * 2;
  const drag = { active: false, lastX: 0, spin: 0, vel: 0 };
  const canvas = renderer.domElement;
  // Girar a mano es una acción del usuario, así que funciona también con movimiento reducido
  canvas.addEventListener('pointerdown', (e) => {
    drag.active = true;
    drag.lastX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag.active) return;
    drag.vel = (e.clientX - drag.lastX) * 0.012;
    drag.spin += drag.vel;
    drag.lastX = e.clientX;
  });
  const release = () => (drag.active = false);
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  const t0 = performance.now();
  let introDone = false;

  const setOpacity = (o: number) => {
    meshMat.opacity = o;
    backMat.opacity = o;
  };

  const finishIntro = () => {
    introDone = true;
    group.remove(dust);
    dustGeo.dispose();
    dustMat.dispose();
    for (const m of [meshMat, backMat]) {
      m.opacity = 1;
      m.transparent = false;
      m.needsUpdate = true;
    }
  };

  const frame = (now: number) => {
    const t = (now - t0) / 1000;

    if (!introDone) {
      const arr = dustPos.array as Float32Array;
      for (let p = 0; p < PARTICLES; p++) {
        const k = easeOut(clamp01((t - delay[p]) / INTRO.gather));
        const swirl = (1 - k) * 0.8;
        for (let a = 0; a < 3; a++) {
          const i = p * 3 + a;
          arr[i] = start[i] + (target[i] - start[i]) * k;
        }
        arr[p * 3] += Math.sin(t * 2 + p) * swirl;
      }
      dustPos.needsUpdate = true;
      setOpacity(range(t, INTRO.meshIn));
      dustMat.opacity = 1 - range(t, INTRO.dustOut);
      group.scale.setScalar(0.94 + 0.06 * easeOut(range(t, INTRO.meshIn)));
      if (t > INTRO.dustOut[1]) finishIntro();
    }

    if (!drag.active) {
      drag.spin += drag.vel;
      drag.vel *= 0.94;
      if (Math.abs(drag.vel) < 0.002) drag.spin += (Math.round(drag.spin / TURN) * TURN - drag.spin) * 0.04;
    }

    // Giro de entrada mientras se junta el polvo, luego vaivén continuo + cursor + arrastre.
    // Con movimiento reducido: sin entrada ni flotación, y un vaivén más lento y corto.
    const auto = reduced ? 0 : 1;
    const entrance = -Math.PI * 0.9 * (1 - easeOut(range(t, INTRO.turn))) * auto;
    const sway = reduced ? Math.sin(t * 0.3) * 0.3 : Math.sin(t * 0.45) * 0.5;
    group.rotation.y += (entrance + sway + pointer.x * 0.3 + drag.spin - group.rotation.y) * 0.08;
    group.rotation.x += ((Math.sin(t * 0.3) * 0.08) * auto + pointer.y * 0.15 - group.rotation.x) * 0.05;
    group.rotation.z = Math.sin(t * 0.5) * 0.03 * auto;
    group.position.y = Math.sin(t * 0.7) * 0.08 * auto;

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
