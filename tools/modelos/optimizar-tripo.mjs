// Optimiza un modelo de Tripo para la web: simplifica y comprime malla y texturas.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, weld, simplify, textureCompress, meshopt, dedup } from '@gltf-transform/functions';
import { MeshoptSimplifier, MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';
const [,, src, dst, ratio = '0.04', size = '2048'] = process.argv;
await MeshoptSimplifier.ready; await MeshoptEncoder.ready; await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(src);
for (const ext of doc.getRoot().listExtensionsUsed()) if (ext.extensionName === 'KHR_materials_volume') ext.dispose();
const S = Number(size);
await doc.transform(
  dedup(), weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: Number(ratio), error: 0.002 }),
  textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [S, S], quality: 85, slots: /^(?!normal)/ }),
  textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [S, S], quality: 92, slots: /normal/ }),
  prune(),
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
);
await io.write(dst, doc);
for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) console.log('triángulos', p.getIndices().getCount() / 3);
