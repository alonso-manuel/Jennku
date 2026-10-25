# ENFiBRART: landing

Landing de **ENFiBRART**, taller de esculturas en fibra de vidrio, resina y látex (Lima, Perú), formado por estudiantes de Bellas Artes.
Contexto del cliente, sitio de referencia, decisiones de diseño y pendientes: **[docs/BRIEFING.md](docs/BRIEFING.md)**. Léelo antes de hacer cambios de contenido o diseño.

Para guías específicas de Astro, ver [AGENTS.md](AGENTS.md).

## Comandos
```bash
npm install        # primera vez
npm run dev        # http://localhost:4321
npm run build      # genera dist/
npm run preview    # sirve dist/
```

## Estructura
- `src/data/site.ts`: **todo el contenido editable** (contacto, frases del Hero, servicios, obras de la Sala, pasos, testimonios). Los datos marcados `// FICTICIO` son de relleno.
- `src/layouts/Layout.astro`: `<head>` (SEO, Open Graph, JSON-LD LocalBusiness, fuentes) y el script de animación `.reveal`.
- `src/pages/galeria.astro` (`/galeria`): galería del taller con dos videos (el mismo retrato en arcilla y terminado) y fotos con filtros y vista en grande. Fotos y videos en `public/galeria/`; la lista de fotos es `galeria` en `site.ts`. Los originales están en `modelos-originales/trabajo/`.
- `src/pages/empresa.astro` (`/empresa`): diseño Manifiesto (frase, foto del taller, tres valores y equipo). Textos y equipo en `empresa` (`site.ts`), de ejemplo hasta tener los datos; retratos en `public/equipo/`.
- `src/components/`: una sección por archivo (Header, Hero, Services, Sala, Process, About, Contact, Footer). Los enlaces del menú llevan `/` delante (`/#obras`) para funcionar también desde `/galeria` y `Placeholder.astro` para imágenes pendientes.
- `src/scripts/hero3d.ts`: escena 3D del Hero (Three.js) en un canvas que cubre toda la sección. Coreografía: la figura (`figura.glb`) sube al centro con el nombre ENFiBRART detrás, hace una pausa, se desplaza a su recuadro (`[data-sculpture]`) y recién ahí entra el texto (clase `.text-in`). Los tiempos están en la constante `T`. Si falla, el Hero muestra `figura.webp` y el texto entra de inmediato.
- `src/scripts/oilText.ts`: "óleo vivo" de la palabra *imaginas* del Hero: un canvas superpuesto pinta pinceladas en bucle recortadas con la forma del texto (el texto sigue en el HTML, transparente). Si falla, queda el dorado liso.
- Frases rotativas del Hero: `heroLines` en `site.ts`.
- Proceso (`Process.astro`): recorrido con la imagen fija que cambia de etapa al bajar. Pasos, plazos e imágenes en `steps` (`site.ts`); imágenes en `public/proceso/`.
- `src/scripts/model3d.ts` y `src/scripts/mask3d.ts`: versiones anteriores del Hero (una sola pieza). No se usan; se conservan para poder volver.
- `tools/modelos/`: scripts para optimizar modelos (escaneos de KIRI Engine y modelos de Tripo). Los originales van en `modelos-originales/` (fuera de `public/`).
- `src/styles/global.css`: tokens de diseño (`:root`), utilidades (`.container`, `.section`, `.eyebrow`, `.section-title`, `.lead`, `.btn`).
- Marca: **ENFiBRART** (así, con la *i* minúscula), siempre en Lexend Zetta SemiBold (`--font-brand`) y como texto, no imagen. Reemplazó al nombre anterior, Jennku.
- `public/brand/`: `busto.png` / `busto.webp`, el ícono del logo de ENFiBRART (busto, color hueso sobre fondo transparente). Se usa en el header, en los marcadores de foto pendiente y como logo en los datos para Google. `public/favicon.png`, `apple-touch-icon.png` y `og.jpg` (imagen al compartir el enlace) salen del mismo busto. Están hechos a partir de una captura de 185 px: reemplazarlos por el vectorial cuando llegue.

## Convenciones
- Todo el texto visible va en **español de Perú**, con tuteo y sin mayúsculas gritadas ni "!!".
- Estilos con scope dentro de cada componente (`<style>`). Solo lo compartido va a `global.css`. Usa siempre las variables de color y tipografía. Paleta negro y oro: `--ink` (fondo), `--bone` (texto), `--oro` (acento y botón principal, con texto oscuro), `--resina` (detalle).
- Sin frameworks de UI ni Tailwind. JS mínimo en `<script>` de Astro. Única librería: Three.js, solo para el 3D y siempre con carga diferida.
- La Sala (`Sala.astro`, `#obras`) muestra las obras de `obras` en `site.ts`. Para agregar una: foto de frente en `public/obras/<slug>.webp` y `<slug>-sm.webp` (480 px), modelo optimizado en `public/modelos/<slug>.glb` (ver `tools/modelos/`) y una entrada en `obras`. Sin `model`, la obra se abre solo con la foto. El visor 3D (`src/scripts/viewer3d.ts`) se carga solo al abrir una obra.
- Fotos y modelos originales sin comprimir van en `modelos-originales/` (no se suben ni se publican).
- Los CTAs usan `waLink()` de `site.ts`; no escribas URLs de WhatsApp a mano.
- Accesibilidad: `alt` en imágenes reales, foco visible y respeto a `prefers-reduced-motion` (ya está en el CSS). Excepción: en el Hero, el movimiento reducido suaviza las animaciones en vez de quitarlas.
- Comprueba que no haya scroll horizontal a 375 px de ancho.

## Notas
- Hosting: Netlify, conectado al repositorio de GitHub (se despliega solo con cada push a `main`). Configuración en `netlify.toml`. Mientras esté en el dominio de pruebas de Spaceship lleva `noindex` (cabecera `X-Robots-Tag` en `netlify.toml`); hay que quitarla al pasar al dominio final.
