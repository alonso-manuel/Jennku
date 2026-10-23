// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://jennku.pe', // FICTICIO: cambiar por el dominio real
  vite: {
    // Las partes de Three.js se cargan con import() recién al usarse. Declararlas aquí evita que el
    // servidor de desarrollo las descubra tarde y responda "504 Outdated Optimize Dep".
    optimizeDeps: {
      include: [
        'three',
        'three/examples/jsm/loaders/GLTFLoader.js',
        'three/examples/jsm/controls/OrbitControls.js',
        'three/examples/jsm/libs/meshopt_decoder.module.js',
      ],
    },
  },
});
