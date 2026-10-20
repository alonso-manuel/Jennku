# Optimizar modelos escaneados

`optimizar-tripo.mjs` simplifica y comprime modelos de Tripo (sin piso que quitar): `node optimizar-tripo.mjs entrada.glb salida.glb 0.04 2048` (proporción de triángulos y tamaño de textura).

`optimizar-busto.mjs` toma un `.glb` exportado de KIRI Engine y lo deja listo para la web:

1. Lo endereza usando el piso escaneado como referencia (ajusta un plano y lo pone horizontal).
2. Quita el piso.
3. Simplifica la malla (~18 % de los triángulos) cuidando que la textura no se deforme en las costuras.
4. Pasa la textura a WebP de 2048 px y comprime la malla con meshopt.

Los paquetes que usa no son dependencias del sitio. Para correrlo, en una carpeta aparte:

```bash
npm i @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer sharp
WUV=4 node optimizar-busto.mjs entrada.glb salida.glb 0.18 0.03
```

Argumentos: proporción de triángulos a conservar y altura del corte del piso (en las unidades del modelo). `WUV` es el peso de las UV al simplificar (más alto = protege más la textura).

Los originales sin comprimir van en `modelos-originales/` (fuera de `public/`, para que no se publiquen).
