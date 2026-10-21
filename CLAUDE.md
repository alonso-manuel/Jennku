# Jennku: landing

Landing de **Jennku**, taller de esculturas en fibra de vidrio, resina y látex (Lima, Perú), formado por estudiantes de Bellas Artes.
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
- `src/data/site.ts`: **todo el contenido editable** (contacto, servicios, proyectos, pasos, cifras, testimonios). Los datos marcados `// FICTICIO` son de relleno.
- `src/layouts/Layout.astro`: `<head>` (SEO, Open Graph, JSON-LD LocalBusiness, fuentes) y el script de animación `.reveal`.
- `src/components/`: una sección por archivo (Header, Hero, Services, Gallery, Process, About, Contact, Footer) y `Placeholder.astro` para imágenes pendientes.
- `src/scripts/hero3d.ts`: escena 3D del Hero (Three.js) en un canvas que cubre toda la sección. Coreografía: la figura (`figura.glb`) sube al centro con la palabra JENNKU detrás, hace una pausa, se desplaza a su recuadro (`[data-sculpture]`) y recién ahí entra el texto (clase `.text-in`). Los tiempos están en la constante `T`. Si falla, el Hero muestra `figura.webp` y el texto entra de inmediato.
- `src/scripts/oilText.ts`: "óleo vivo" de la palabra *imaginas* del Hero: un canvas superpuesto pinta pinceladas en bucle recortadas con la forma del texto (el texto sigue en el HTML, transparente). Si falla, queda el dorado liso.
- Frases rotativas del Hero: `heroLines` en `site.ts`.
- `src/scripts/model3d.ts` y `src/scripts/mask3d.ts`: versiones anteriores del Hero (una sola pieza). No se usan; se conservan para poder volver.
- `tools/modelos/`: scripts para optimizar modelos (escaneos de KIRI Engine y modelos de Tripo). Los originales van en `modelos-originales/` (fuera de `public/`).
- `src/styles/global.css`: tokens de diseño (`:root`), utilidades (`.container`, `.section`, `.eyebrow`, `.section-title`, `.lead`, `.btn`).
- `public/brand/`: logo del cliente (`mascara.png`, `jennku-wordmark.png`, en color hueso sobre fondo transparente).

## Convenciones
- Todo el texto visible va en **español de Perú**, con tuteo y sin mayúsculas gritadas ni "!!".
- Estilos con scope dentro de cada componente (`<style>`). Solo lo compartido va a `global.css`. Usa siempre las variables de color y tipografía. Paleta negro y oro: `--ink` (fondo), `--bone` (texto), `--oro` (acento y botón principal, con texto oscuro), `--resina` (detalle).
- Sin frameworks de UI ni Tailwind. JS mínimo en `<script>` de Astro. Única librería: Three.js, solo para el 3D y siempre con carga diferida.
- Para agregar una foto real a un proyecto: guárdala en `public/proyectos/` y agrega `image: '/proyectos/archivo.jpg'` en `projects` (`site.ts`). La galería deja de usar el placeholder sola.
- Los CTAs usan `waLink()` de `site.ts`; no escribas URLs de WhatsApp a mano.
- Accesibilidad: `alt` en imágenes reales, foco visible y respeto a `prefers-reduced-motion` (ya está en el CSS). Excepción: en el Hero, el movimiento reducido suaviza las animaciones en vez de quitarlas.
- Comprueba que no haya scroll horizontal a 375 px de ancho.

## Notas
- El hosting será Netlify con un dominio de pruebas de Spaceship. Mientras esté en ese dominio, el sitio debe llevar `noindex` (pendiente).
