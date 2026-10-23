// Datos del sitio. Todo lo marcado como FICTICIO se reemplaza cuando Jennku entregue la información real.

export const site = {
  name: 'Jennku',
  tagline: 'Esculturas en fibra de vidrio, resina y látex',
  description:
    'Taller de escultores formados en Bellas Artes del Perú. Creamos esculturas, bustos, monumentos, dummies publicitarios y letras 3D en fibra de vidrio, resina y látex, a cualquier escala y con envíos a todo el país.',
  url: 'https://jennku.pe', // FICTICIO
  whatsapp: '51900000000', // FICTICIO: solo dígitos, con código de país
  phoneDisplay: '+51 900 000 000', // FICTICIO
  email: 'hola@jennku.pe', // FICTICIO
  address: 'Lima, Perú', // FICTICIO
  hours: 'Lun a Sáb · 9:00 a 18:00', // FICTICIO
  social: {
    instagram: '#',
    tiktok: '#',
    facebook: '#',
  },
};

export const waLink = (text = 'Hola Jennku, quiero cotizar un proyecto.') =>
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

export const steps = [
  { n: '01', title: 'Idea y boceto', text: 'Nos cuentas lo que necesitas. Dibujamos y modelamos en 3D hasta que la pieza sea exactamente la que imaginas.' },
  { n: '02', title: 'Modelado y molde', text: 'Esculpimos el original en arcilla, espuma o plastilina y fabricamos el molde para reproducirlo.' },
  { n: '03', title: 'Laminado', text: 'Laminamos en fibra de vidrio, resina o látex según el uso: interior, exterior, liviano o resistente.' },
  { n: '04', title: 'Acabado y entrega', text: 'Lijado, pintura automotriz o pátina y barniz de protección. Embalamos y enviamos a todo el Perú.' },
];

// FICTICIO
export const testimonials = [
  {
    quote: 'Necesitábamos un producto gigante para un lanzamiento en dos semanas y llegó impecable. Fue lo más fotografiado del evento.',
    name: 'Carla M.',
    role: 'Jefa de marketing, marca de consumo masivo',
  },
  {
    quote: 'El busto quedó con un parecido increíble. Se nota la formación artística del equipo en cada detalle.',
    name: 'Jorge R.',
    role: 'Gerente municipal',
  },
  {
    quote: 'Nos asesoraron en materiales para exterior y después de un año la pieza sigue como nueva.',
    name: 'Lucía P.',
    role: 'Administradora, parque recreacional',
  },
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
