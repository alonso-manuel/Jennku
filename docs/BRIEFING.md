# Briefing: landing de Jennku

## Cliente
- **Nombre:** Jennku
- **Rubro:** esculturas en fibra de vidrio, resina y látex, a pedido y a cualquier escala.
- **Equipo:** estudiantes de **Bellas Artes del Perú** (ENSABAP). Es su diferencial frente a la competencia: formación académica en anatomía, proporción y modelado. Más adelante se puede ampliar en una sección propia o en una página "Nosotros".
- **Ubicación:** Lima, Perú. Hacen envíos a todo el país.
- **Material entregado hasta ahora:** solo el logo (máscara y wordmark), en `public/brand/`. Todo lo demás es ficticio (ver "Datos ficticios").

## Sitio de referencia (competencia)
**https://www.esculturasenfibradevidrio.com.pe/** (AZULADO S.A.C., Puente Piedra, Lima)

No se copia. Sirve como referencia de **qué ofrece el rubro**. La idea es hacerlo bastante mejor.

### Qué ofrecen (y Jennku también)
- Materiales: fibra de vidrio, resina, látex
- Productos: esculturas, estatuas, bustos, monumentos, dummies y muñecos publicitarios, logotipos y letras 3D, carteles, réplicas, arte sacro, trofeos y premios, personajes de cómic, elementos para parques temáticos, piscinas y toboganes, moldes y reproducciones arqueológicas
- Mercados: artístico, publicitario, comercial y decorativo
- Proceso: diseño → moldes → ejecución → acabado

### Lo que hacen mal (y evitamos)
- Relleno SEO repetitivo ("esculturas en fibra de vidrio lima peru" al final de cada párrafo)
- Faltas de ortografía ("tridimencional", "alcanse", "Recina")
- Las fotos no son protagonistas, a pesar de ser un negocio visual
- Plantilla genérica: contadores de "100% Calidad", numeración 01/02/03 sin sentido
- Llamadas a la acción gritadas y repetidas ("COTIZA HOY!!")

## Decisiones tomadas
- **Stack:** Astro (estático), sin frameworks de UI ni Tailwind; CSS con scope por componente.
- **Hosting:** Netlify (gratis), con el dominio de pruebas comprado en Spaceship. La versión final irá en el dominio propio del cliente.
- **SEO:** las demos en el dominio de pruebas deben llevar `noindex` (ver pendientes). El sitio final sí se indexa.
- **Dirección visual:** galería o taller de arte con fondo oscuro cálido, para que resalten los colores de las piezas.
  - Colores (negro y oro, elegida en la comparación de paletas): tinta `#0c0a09`, hueso `#faf9f6`, oro `#ca8a04` (acento y botón principal, con texto oscuro: contraste 6,7), resina `#e0b75a` (detalle). Reemplaza a la paleta anterior con rojo laca `#c8452c`, cuyo botón no llegaba al contraste mínimo.
  - Tipografía: Cormorant (títulos, serif clásica a juego con el wordmark) y Manrope (texto)
- **3D:** el Hero sigue la propuesta "Fundición" (ver los cinco rediseños). La figura con máscara dorada sube al centro con JENNKU en contorno dorado detrás, hace una pausa y se desplaza a la derecha (JENNKU y el brillo la acompañan, más pequeños) y entra el texto. Luego se mece, sigue al cursor y se puede girar arrastrando. (Se probó sumar el busto y la máscara saliendo a los costados; se descartó.) Con `prefers-reduced-motion` la coreografía se mantiene (es el contenido del Hero; el equipo pidió que se vea en todos los equipos), el vaivén posterior es más lento y el texto entra con recorridos cortos. Si el 3D falla, se muestra `figura.webp`.
- **Titular del Hero:** Playfair Display (elegida entre ocho fuentes). La palabra *imaginas* se rellena con "óleo vivo": pinceladas en ocre, carmín, ultramar, verde y oro que se pintan sin parar. Debajo, seis frases que rotan en bucle (`heroLines`).
- **Header:** logo a la izquierda, menú centrado y "Cotizar" con borde a la derecha.
- **Conversión:** WhatsApp es el canal principal (botón flotante, CTAs, formulario que arma el mensaje y abre WhatsApp). No hay backend.

## Estructura de la landing
1. Hero: titular con entrada animada, CTA a WhatsApp, escultura 3D (las cifras y la marquesina de materiales se quitaron por decisión del equipo)
2. Sala (`#obras`): muro de galería con las 6 obras del taller (fotos de estudio y cartela). Cada una se abre en grande con su ficha y se puede girar en 3D. Más adelante, con más obras, una página `/galeria`
3. Servicios (5, definidos por el equipo): escultura en fibra, esculturas publicitarias, restauraciones, escultura digital y pedidos personalizados. Mosaico con el primero en casilla grande; "Pedidos personalizados" es la casilla dorada que invita a contar una idea. Cada casilla abre WhatsApp con el servicio escrito. Por ahora todas muestran "Foto pendiente"
4. Proceso (4 pasos) y materiales
5. El taller (Bellas Artes) y testimonios
6. Contacto: formulario → WhatsApp
7. Footer y botón flotante de WhatsApp

## Datos ficticios (reemplazar cuando el cliente los entregue)
Todo está centralizado en `src/data/site.ts` y marcado con `// FICTICIO`:
- WhatsApp, teléfono, correo, dirección, horario, redes sociales
- URL final del sitio (`site.url`, también en `astro.config.mjs`)
- Títulos, materiales, medidas, años y textos de las obras de la Sala (`obras`)
- Testimonios (`testimonials`)

## Pendientes
- [ ] Fotos para los 4 servicios del mosaico (el personalizado no lleva foto) → `public/servicios/` y `image` en `services`
- [ ] Confirmar con el cliente títulos y datos de las 6 obras de la Sala
- [ ] Fotos del taller y del equipo (sección "El taller", hoy con placeholders)
- [ ] Datos de contacto reales y redes
- [ ] Testimonios reales (o quitarlos si no hay)
- [ ] `noindex` mientras viva en el dominio de pruebas (meta robots en `Layout.astro` o `_headers` en Netlify)
- [ ] Imagen Open Graph propia (1200×630) para compartir en WhatsApp y redes
- [ ] Deploy en Netlify y conexión del dominio de Spaceship
- [ ] La IA le agregó a la figura una cola que no tiene la obra real (cuelga bajo la base): decidir si se recorta
- [ ] El escaneo del busto tiene reflejos claros en la mejilla y la oreja; si se repite, usar luz más difusa
- [ ] Visor 3D de proyectos en la galería cuando haya modelos (.glb) o escaneos de las piezas
- [ ] Más adelante: página "Nosotros" con el equipo de Bellas Artes, páginas por servicio para SEO
