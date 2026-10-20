// Endereza el busto, quita el piso escaneado y comprime para la web.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, weld, simplify, textureCompress, meshopt, dedup } from '@gltf-transform/functions';
import { MeshoptSimplifier, MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';

const [,, src, dst, ratioArg, marginArg] = process.argv;
const RATIO = Number(ratioArg ?? 0.2);
const MARGIN = Number(marginArg ?? 0.015);
await MeshoptSimplifier.ready; await MeshoptEncoder.ready; await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(src);
const node = doc.getRoot().listNodes()[0];
const prim = node.getMesh().listPrimitives()[0];
const P = prim.getAttribute('POSITION'), N = prim.getAttribute('NORMAL');
const pos = P.getArray(), nor = N.getArray(), n = pos.length / 3;

// 1) a coordenadas de mundo (rotación de 90° en X del nodo): x, y=-z, z=y
for (const a of [pos, nor]) for (let i = 0; i < n; i++) { const y = a[i*3+1], z = a[i*3+2]; a[i*3+1] = -z; a[i*3+2] = y; }
node.setRotation([0, 0, 0, 1]);

// 2) plano del piso por mínimos cuadrados con puntos lejos de la cabeza
let ys = []; for (let i = 0; i < n; i++) ys.push(pos[i*3+1]); ys.sort((a, b) => a - b);
const top = ys[0] + (ys[n-1] - ys[0]) * 0.5;
let mnx=1e9,mxx=-1e9,mnz=1e9,mxz=-1e9;
for (let i = 0; i < n; i++) if (pos[i*3+1] > top) { mnx=Math.min(mnx,pos[i*3]); mxx=Math.max(mxx,pos[i*3]); mnz=Math.min(mnz,pos[i*3+2]); mxz=Math.max(mxz,pos[i*3+2]); }
const cx=(mnx+mxx)/2, cz=(mnz+mxz)/2, rad=Math.max(mxx-mnx,mxz-mnz)/2;
// y = a x + b z + c
let S = Array(9).fill(0), T = [0,0,0], cnt = 0;
for (let i = 0; i < n; i++) {
  const x = pos[i*3], y = pos[i*3+1], z = pos[i*3+2];
  if (Math.hypot(x-cx, z-cz) < rad * 1.6) continue;
  const v = [x, z, 1]; cnt++;
  for (let r = 0; r < 3; r++) { T[r] += v[r]*y; for (let c = 0; c < 3; c++) S[r*3+c] += v[r]*v[c]; }
}
const det3 = (m) => m[0]*(m[4]*m[8]-m[5]*m[7]) - m[1]*(m[3]*m[8]-m[5]*m[6]) + m[2]*(m[3]*m[7]-m[4]*m[6]);
const D = det3(S); const sol = [0,1,2].map(k => { const m = S.slice(); for (let r = 0; r < 3; r++) m[r*3+k] = T[r]; return det3(m) / D; });
const [A, B, C] = sol;
let res = []; for (let i = 0; i < n; i++) { const x=pos[i*3],y=pos[i*3+1],z=pos[i*3+2]; if (Math.hypot(x-cx,z-cz) >= rad*1.6) res.push(Math.abs(y-(A*x+B*z+C))); }
res.sort((a,b)=>a-b);
console.log('plano', sol.map(v=>v.toFixed(4)), 'puntos', cnt, 'residuo p50', res[res.length>>1].toFixed(4), 'p95', res[Math.floor(res.length*.95)].toFixed(4));

// 3) rotar para que la normal del piso apunte hacia arriba y llevar el piso a y=0
let nx = -A, ny = 1, nz = -B; const L = Math.hypot(nx, ny, nz); nx/=L; ny/=L; nz/=L;
// rotación de (nx,ny,nz) a (0,1,0): eje = n x up, ángulo = acos(ny)
let ax = -nz, az = nx; const s = Math.hypot(ax, az), ang = Math.acos(ny);
ax /= s || 1; az /= s || 1;
const rot = (x, y, z) => { // Rodrigues con eje (ax,0,az)
  const c = Math.cos(ang), sn = Math.sin(ang), dot = ax*x + az*z;
  const crx = 0*z - az*y, cry = az*x - ax*z, crz = ax*y - 0*x;
  return [x*c + crx*sn + ax*dot*(1-c), y*c + cry*sn, z*c + crz*sn + az*dot*(1-c)];
};
const p0 = rot(cx, A*cx + B*cz + C, cz);
for (let i = 0; i < n; i++) {
  const [x, y, z] = rot(pos[i*3]-0, pos[i*3+1], pos[i*3+2]); pos[i*3] = x - p0[0]; pos[i*3+1] = y - p0[1]; pos[i*3+2] = z - p0[2];
  const [a, b, c2] = rot(nor[i*3], nor[i*3+1], nor[i*3+2]); nor[i*3] = a; nor[i*3+1] = b; nor[i*3+2] = c2;
}
console.log('inclinación corregida', (ang * 180 / Math.PI).toFixed(1), '°');

// 4) quitar triángulos del piso (todos sus vértices por debajo del margen)
const idx = prim.getIndices().getArray(); const keep = [];
for (let t = 0; t < idx.length; t += 3) {
  const a = idx[t], b = idx[t+1], c = idx[t+2];
  if (pos[a*3+1] < MARGIN && pos[b*3+1] < MARGIN && pos[c*3+1] < MARGIN) continue;
  // restos de piso lejos del busto
  const far = (v) => Math.hypot(pos[v*3], pos[v*3+2]) > rad * 1.2 && pos[v*3+1] < 0.12;
  if (far(a) || far(b) || far(c)) continue;
  keep.push(a, b, c);
}
console.log('triángulos', idx.length/3, '->', keep.length/3);
prim.getIndices().setArray(new Uint32Array(keep));
P.setArray(pos); N.setArray(nor);

await doc.transform(
  prune(), dedup(), weld(),
  (d) => { // simplificación permisiva: cruza las costuras de UV de la fotogrametría
    for (const m of d.getRoot().listMeshes()) for (const pr of m.listPrimitives()) {
      const ind = pr.getIndices().getArray();
      const ps = pr.getAttribute('POSITION').getArray();
      const target = Math.floor(ind.length * RATIO / 3) * 3;
      const uvs = new Float32Array(pr.getAttribute('TEXCOORD_0').getArray());
      const W_UV = Number(process.env.WUV ?? 1);
      const [out, err] = MeshoptSimplifier.simplifyWithAttributes(new Uint32Array(ind), new Float32Array(ps), 3, uvs, 2, [W_UV, W_UV], null, target, 0.01, ['Permissive']);
      console.log('simplify', ind.length / 3, '->', out.length / 3, 'error', err.toFixed(5));
      pr.getIndices().setArray(out);
    }
  },
  textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [2048, 2048], quality: 82 }),
  prune(),
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
);
await io.write(dst, doc);
console.log('ok');
