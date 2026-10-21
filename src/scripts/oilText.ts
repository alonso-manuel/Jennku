// "Óleo vivo": rellena una palabra con pinceladas de óleo que se pintan sin parar.
// Un canvas se superpone exactamente al texto (que sigue en el HTML para lectores de pantalla y
// buscadores, solo que transparente). Las pinceladas siguen un campo de ruido y se acumulan en una capa;
// en cada cuadro esa capa se recorta con la forma del texto.

const PALETTE = ['#c8961e', '#9b2226', '#1f3a7a', '#2f6b5a', '#e0b75a', '#efe3c6', '#6b3d1f', '#c2562a', '#3d1f4f'];
const BASE = '#5a3a1a'; // imprimación ocre oscura antes de las primeras pinceladas
const STROKES = 150;

// Ruido de valor simple
function makeNoise(seed: number) {
  const p = new Float32Array(512);
  let s = seed;
  for (let i = 0; i < 512; i++) {
    s = (s * 16807) % 2147483647;
    p[i] = s / 2147483647;
  }
  const h = (x: number, y: number) => p[(((x * 73856093) ^ (y * 19349663)) >>> 0) % 512];
  const sm = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
    const u = sm(xf), v = sm(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}

export async function mountOilText(el: HTMLElement) {
  const text = el.textContent?.trim() ?? '';
  if (!text) return;
  const style = getComputedStyle(el);
  const fontOf = (px: number) => `${style.fontStyle} ${style.fontWeight} ${px}px ${style.fontFamily}`;
  await document.fonts.load(fontOf(64), text);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const speed = reduced ? 0.35 : 1;
  const noise = makeNoise(7);
  const fbm = (x: number, y: number) => noise(x, y) * 0.5 + noise(x * 2, y * 2) * 0.25 + noise(x * 4, y * 4) * 0.125;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'oil-canvas';
  const ctx = canvas.getContext('2d')!;
  const layer = document.createElement('canvas');
  const lctx = layer.getContext('2d')!;

  let dpr = 1, fs = 0, pad = 0, baseline = 0;
  type Stroke = { x: number; y: number; c: string; life: number };
  let strokes: Stroke[] = [];
  const pick = () => PALETTE[(Math.random() * PALETTE.length) | 0];

  const layout = () => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    fs = parseFloat(getComputedStyle(el).fontSize);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    pad = Math.ceil(fs * 0.15); // margen para la inclinación de la cursiva
    const W = r.width + pad * 2, H = r.height + pad * 2;
    canvas.width = layer.width = Math.round(W * dpr);
    canvas.height = layer.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    canvas.style.left = canvas.style.top = `${-pad}px`;
    // Línea base igual a la del texto HTML: medio interlineado + ascendente de la fuente
    ctx.font = fontOf(fs);
    const m = ctx.measureText(text);
    const asc = m.fontBoundingBoxAscent, desc = m.fontBoundingBoxDescent;
    baseline = (r.height - (asc + desc)) / 2 + asc;
    lctx.fillStyle = BASE;
    lctx.fillRect(0, 0, layer.width, layer.height);
    strokes = Array.from({ length: STROKES }, () => ({
      x: Math.random() * layer.width,
      y: Math.random() * layer.height,
      c: pick(),
      life: Math.random() * 80,
    }));
  };

  const paint = (t: number) => {
    const w = layer.width, h = layer.height;
    const unit = (fs || 60) * dpr;
    const steps = Math.max(1, Math.round(4 * speed));
    lctx.lineCap = 'round';
    lctx.globalAlpha = 0.7;
    for (let s = 0; s < steps; s++) {
      for (const q of strokes) {
        const a = fbm(q.x / (unit * 0.5), q.y / (unit * 0.5) + t * 0.05) * Math.PI * 4;
        const nx = q.x + Math.cos(a) * unit * 0.012;
        const ny = q.y + Math.sin(a) * unit * 0.012;
        lctx.strokeStyle = q.c;
        lctx.lineWidth = unit * (0.035 + 0.07 * ((q.life % 30) / 30));
        lctx.beginPath();
        lctx.moveTo(q.x, q.y);
        lctx.lineTo(nx, ny);
        lctx.stroke();
        q.x = nx;
        q.y = ny;
        q.life -= 1;
        if (q.life <= 0 || q.x < -20 || q.x > w + 20 || q.y < -20 || q.y > h + 20) {
          q.x = Math.random() * w;
          q.y = Math.random() * h;
          q.c = pick();
          q.life = 40 + Math.random() * 80;
        }
      }
    }
    lctx.globalAlpha = 1;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(layer, 0, 0);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.font = fontOf(fs * dpr);
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#000';
    ctx.fillText(text, pad * dpr, (pad + baseline) * dpr);
    ctx.globalCompositeOperation = 'source-over';
  };

  layout();
  el.appendChild(canvas);
  el.classList.add('is-painted');
  new ResizeObserver(layout).observe(el);

  // Solo pinta mientras la palabra está en pantalla y la pestaña visible
  let visible = true;
  let raf = 0;
  const loop = (now: number) => {
    paint(now / 1000);
    raf = requestAnimationFrame(loop);
  };
  const sync = () => {
    cancelAnimationFrame(raf);
    if (visible && !document.hidden) raf = requestAnimationFrame(loop);
  };
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    sync();
  }).observe(el);
  document.addEventListener('visibilitychange', sync);
}
