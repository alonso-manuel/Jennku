// Datos del sitio. Todo lo marcado como FICTICIO se reemplaza cuando ENFiBRART entregue la información real.

export const site = {
  name: 'ENFiBRART',
  tagline: 'Esculturas en fibra de vidrio, resina y látex',
  description:
    'Taller de escultores formados en Bellas Artes del Perú. Creamos esculturas, bustos, monumentos, dummies publicitarios y letras 3D en fibra de vidrio, resina y látex, a cualquier escala y con envíos a todo el país.',
  url: 'https://enfibrart.pe', // FICTICIO
  whatsapp: '51900000000', // FICTICIO: solo dígitos, con código de país
  phoneDisplay: '+51 900 000 000', // FICTICIO
  email: 'hola@enfibrart.pe', // FICTICIO
  address: 'Lima, Perú', // FICTICIO
  hours: 'Lun a Sáb · 9:00 a 18:00', // FICTICIO
  social: {
    instagram: '#',
    tiktok: '#',
    facebook: '#',
  },
};

export const waLink = (text = 'Hola ENFiBRART, quiero cotizar un proyecto.') =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

// Servicios: en este orden se arma el mosaico (el primero va en la casilla grande).
// El que lleva `custom: true` se muestra como la casilla dorada que invita a contar una idea.
// Para poner una foto, guárdala en public/servicios/ y agrega `image: '/servicios/archivo.webp'`.
export const services: { title: string; text: string; tags: string[]; image?: string; custom?: boolean }[] = [
  {
    title: 'Escultura en fibra',
    text: 'Esculturas, estatuas y bustos en fibra de vidrio y resina: livianos, resistentes y para interior o exterior, a cualquier escala.',
    tags: ['Arte', 'Bustos', 'Monumentos'],
  },
  {
    title: 'Esculturas publicitarias',
    text: 'Dummies, productos gigantes, mascotas de marca y letras 3D para campañas, ferias y puntos de venta.',
    tags: ['Campañas', 'Eventos', 'Retail'],
  },
  {
    title: 'Restauraciones',
    text: 'Devolvemos su forma y acabado a esculturas dañadas: grietas, piezas rotas, pintura y pátina.',
    tags: ['Arte sacro', 'Patrimonio', 'Exterior'],
  },
  {
    title: 'Escultura digital',
    text: 'Modelamos tu pieza en 3D para que la apruebes desde todos los ángulos antes de fabricarla.',
    tags: ['Modelado 3D', 'Prototipos'],
  },
  {
    title: 'Pedidos personalizados',
    text: '¿Tienes una idea que no encaja en ninguna categoría? Cuéntanosla y la hacemos en el material y tamaño que necesites.',
    tags: ['A medida'],
    custom: true,
  },
];

// Obras de la Sala. Foto de estudio en public/obras/ (versión grande y "-sm" para la grilla)
// y modelo 3D comprimido en public/modelos/. Títulos, medidas, años y textos son provisionales.
export type Obra = {
  slug: string; // nombre de los archivos: /obras/<slug>.webp y /modelos/<slug>.glb
  title: string;
  material: string;
  height: string;
  year: string;
  text: string;
  model?: string; // sin modelo, la obra se abre solo con la foto
};

// FICTICIO: títulos y datos hasta confirmarlos con el cliente
export const obras: Obra[] = [
  {
    slug: 'figura',
    title: 'El que señala',
    material: 'Resina y fibra de vidrio, máscara con pan de oro',
    height: '1,20 m',
    year: '2025',
    text: 'Figura agachada que señala hacia adelante, con una máscara de láminas doradas que le oculta el rostro.',
    model: '/modelos/figura.glb',
  },
  {
    slug: 'gorilla',
    title: 'Orangután',
    material: 'Resina patinada sobre base de madera',
    height: '0,50 m',
    year: '2025',
    text: 'Orangután sentado en reposo. El pelaje está trabajado a mano con textura y pátina rojiza.',
    model: '/modelos/gorilla.glb',
  },
  {
    slug: 'bronce',
    title: 'Retrato',
    material: 'Resina con pátina de bronce',
    height: '0,40 m',
    year: '2025',
    text: 'Retrato de un hombre con el cabello recogido. La pátina imita el bronce fundido.',
    model: '/modelos/bronce.glb',
  },
  {
    slug: 'anubis',
    title: 'Anubis',
    material: 'Resina con acabado de yeso',
    height: '0,70 m',
    year: '2024',
    text: 'Busto del dios egipcio con cabeza de chacal, en un acabado blanco mate.',
    model: '/modelos/anubis.glb',
  },
  {
    slug: 'baby',
    title: 'Origen',
    material: 'Resina con acabado de piedra',
    height: '0,45 m',
    year: '2024',
    text: 'Un bebé sentado y recogido sobre sí mismo, con la superficie manchada como piedra antigua.',
    model: '/modelos/baby.glb',
  },
  {
    slug: 'hombre',
    title: 'Grito',
    material: 'Resina con pátina negra',
    height: '0,85 m',
    year: '2024',
    text: 'Torso de un hombre que grita con el brazo levantado. Estudio de anatomía y tensión.',
    model: '/modelos/hombre.glb',
  },
];

// Proceso (recorrido): la obra de ejemplo pasa por cada etapa. `image` es el modelo 3D de la obra renderizado
// en el material de esa etapa (public/proceso/); cuando haya fotos reales del proceso, se reemplazan ahí.
// FICTICIO: plazos de referencia hasta confirmarlos con el taller
export const steps = [
  { n: '01', week: 'Semana 1', stage: 'Escultura digital', image: '/proceso/etapa-0.webp', title: 'Idea y boceto', text: 'Nos cuentas lo que necesitas. Dibujamos y modelamos en 3D hasta que la pieza sea exactamente la que imaginas.' },
  { n: '02', week: 'Semanas 2 y 3', stage: 'Arcilla', image: '/proceso/etapa-1.webp', title: 'Modelado y molde', text: 'Esculpimos el original a mano en arcilla, espuma o plastilina y fabricamos el molde para reproducirlo.' },
  { n: '03', week: 'Semanas 3 y 4', stage: 'Fibra de vidrio', image: '/proceso/etapa-2.webp', title: 'Laminado', text: 'Laminamos en fibra de vidrio, resina o látex según el uso: interior, exterior, liviano o resistente.' },
  { n: '04', week: 'Semana 5', stage: 'Terminada', image: '/proceso/etapa-3.webp', title: 'Acabado y entrega', text: 'Lijado, pintura automotriz o pátina y barniz de protección. Embalamos y enviamos a todo el Perú.' },
];


// Frases del Hero que rotan en bucle, en este orden, debajo del titular
export const heroLines = [
  'Esculturas, dummies publicitarios, bustos y letras 3D en fibra de vidrio, resina y látex.',
  'Hechas a mano por escultores formados en Bellas Artes del Perú.',
  'De una figura de 20 cm a un monumento de varios metros.',
  'Mascotas de marca y productos gigantes para tu próxima campaña.',
  'Bustos y monumentos para plazas, instituciones y municipios.',
  'Diseñamos, fabricamos y enviamos a todo el Perú.',
];

// Galería (/galeria): fotos del taller en public/galeria/gNN.webp (grande) y gNN-sm.webp (miniatura).
// cat: 'retratos' | 'ornamentos' | 'taller'. Los originales están en modelos-originales/trabajo/.
export type GaleriaCat = 'retratos' | 'ornamentos' | 'taller';
export const galeriaCats: { id: GaleriaCat; label: string }[] = [
  { id: 'retratos', label: 'Esculturas' },
  { id: 'ornamentos', label: 'Restauraciones' },
  { id: 'taller', label: 'Taller' },
];
export const galeria: { src: string; w: number; h: number; alt: string; cat: GaleriaCat }[] = [
  { src: 'g01', w: 1280, h: 1600, cat: 'retratos', alt: 'Busto de mujer con corona de flores bajo luz violeta' },
  { src: 'g02', w: 1200, h: 1600, cat: 'ornamentos', alt: 'Ornamento barroco en arcilla con flores y volutas' },
  { src: 'g03', w: 960, h: 1280, cat: 'retratos', alt: 'Busto de anciano con barba larga, modelado en arcilla' },
  { src: 'g04', w: 1463, h: 1000, cat: 'taller', alt: 'Manos afinando con una herramienta el rostro de un busto de arcilla' },
  { src: 'g05', w: 1204, h: 1600, cat: 'retratos', alt: 'Busto de un joven en arcilla sobre su base' },
  { src: 'g06', w: 1200, h: 1600, cat: 'ornamentos', alt: 'Mascarón ornamental con rostro y volutas, en arcilla' },
  { src: 'g07', w: 1008, h: 1426, cat: 'retratos', alt: 'Busto de hombre con barba en arcilla roja, en una exposición' },
  { src: 'g08', w: 951, h: 1264, cat: 'retratos', alt: 'Busto de hombre en yeso' },
  { src: 'g09', w: 899, h: 1599, cat: 'retratos', alt: 'Busto de mujer con corona de flores, en arcilla' },
  { src: 'g10', w: 1200, h: 1600, cat: 'ornamentos', alt: 'Mascarón con un rostro entre flores, modelado en arcilla' },
  { src: 'g11', w: 861, h: 1280, cat: 'taller', alt: 'Cabeza en arcilla a medio modelar, con la armadura a la vista' },
  { src: 'g12', w: 799, h: 1014, cat: 'retratos', alt: 'Detalle del rostro del busto de un joven en arcilla' },
  { src: 'g13', w: 1600, h: 900, cat: 'ornamentos', alt: 'Relieve de un águila con las alas abiertas, en arcilla' },
  { src: 'g14', w: 922, h: 1444, cat: 'retratos', alt: 'Busto de mujer con cabello ondulado, en arcilla' },
  { src: 'g15', w: 1280, h: 1600, cat: 'retratos', alt: 'Busto de mujer bajo luz de colores' },
  { src: 'g16', w: 1280, h: 1599, cat: 'retratos', alt: 'Detalle del rostro de la mujer con corona de flores' },
  { src: 'g17', w: 1280, h: 861, cat: 'taller', alt: 'Un integrante del taller junto a una cabeza de arcilla' },
  { src: 'g18', w: 899, h: 1599, cat: 'retratos', alt: 'Rostro en relieve modelado en arcilla' },
  { src: 'g19', w: 1203, h: 1600, cat: 'retratos', alt: 'Detalle del rostro del busto en yeso' },
  { src: 'g20', w: 1280, h: 857, cat: 'taller', alt: 'Cabeza masculina en arcilla, de perfil, en el taller' },
  { src: 'g21', w: 725, h: 1181, cat: 'retratos', alt: 'Perfil del busto de un joven en arcilla' },
  { src: 'g22', w: 1600, h: 900, cat: 'taller', alt: 'Piezas ornamentales de yeso en el taller' },
];

// Página /empresa (diseño Manifiesto).
// FICTICIO: textos, valores y equipo de ejemplo hasta tener la información del cliente.
// Para un integrante con foto, guárdala en public/equipo/ y agrega `image: '/equipo/archivo.webp'`.
export const empresa = {
  title: 'Escultores de formación,',
  titleEm: 'fabricantes por oficio.',
  intro:
    'ENFiBRART es un estudio de diseño y producción escultórica formado por artistas de Bellas Artes del Perú. Unimos la técnica académica del modelado con la fabricación en fibra de vidrio, resina y látex.',
  values: [
    { title: 'Mirada de artista', text: 'Anatomía, proporción y composición en cada pieza, sea un busto o una botella gigante.' },
    { title: 'Oficio de taller', text: 'Modelamos, moldeamos, laminamos y pintamos a mano, de principio a fin.' },
    { title: 'Palabra cumplida', text: 'Plazos claros y fotos en cada etapa para que apruebes antes de seguir.' },
  ],
  team: [
    { name: 'Nombre Apellido', role: 'Escultor · Dirección' },
    { name: 'Nombre Apellido', role: 'Escultora · Modelado' },
    { name: 'Nombre Apellido', role: 'Moldes y laminado' },
    { name: 'Nombre Apellido', role: 'Acabados y pátinas' },
  ] as { name: string; role: string; image?: string }[],
};
