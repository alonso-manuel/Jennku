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

export type Category = 'publicidad' | 'arte' | 'monumental' | 'letras' | 'tematico';

export const categories: { id: Category; label: string }[] = [
  { id: 'publicidad', label: 'Publicidad' },
  { id: 'arte', label: 'Arte y bustos' },
  { id: 'monumental', label: 'Monumental' },
  { id: 'letras', label: 'Letras y logos' },
  { id: 'tematico', label: 'Temático' },
];

export const services = [
  {
    title: 'Dummies y muñecos publicitarios',
    text: 'Productos gigantes, mascotas de marca y piezas para activaciones, ferias y lanzamientos.',
    tags: ['Campañas', 'Eventos', 'Retail'],
  },
  {
    title: 'Esculturas y estatuas',
    text: 'Obra artística a pedido, desde piezas de escritorio hasta figuras de tamaño real.',
    tags: ['Arte', 'Decoración', 'Colección'],
  },
  {
    title: 'Bustos y monumentos',
    text: 'Retratos escultóricos y obra conmemorativa para plazas, instituciones y municipios.',
    tags: ['Retrato', 'Institucional', 'Exterior'],
  },
  {
    title: 'Letras y logotipos 3D',
    text: 'Tu marca en volumen, para fachadas, recepciones, stands y escenografías.',
    tags: ['Branding', 'Fachadas', 'Stands'],
  },
  {
    title: 'Parques temáticos y piscinas',
    text: 'Personajes, rocas artificiales, toboganes decorativos y ambientación a gran escala.',
    tags: ['Recreación', 'Gran formato', 'Exterior'],
  },
  {
    title: 'Moldes, réplicas y arte sacro',
    text: 'Reproducciones fieles, piezas arqueológicas, imaginería religiosa, trofeos y premios.',
    tags: ['Moldes', 'Series', 'Restauración'],
  },
];

// FICTICIO: proyectos de ejemplo hasta tener fotos reales.
// Para usar una foto real, agrega `image: '/proyectos/archivo.jpg'`.
export const projects: {
  title: string;
  client: string;
  category: Category;
  size: string;
  material: string;
  image?: string;
  tall?: boolean;
  wide?: boolean;
}[] = [
  { title: 'Botella gigante para lanzamiento', client: 'Marca de bebidas', category: 'publicidad', size: '3.2 m', material: 'Fibra de vidrio', tall: true },
  { title: 'Busto en bronce patinado', client: 'Municipalidad', category: 'monumental', size: '0.9 m', material: 'Resina + pátina' },
  { title: 'Logotipo corpóreo de recepción', client: 'Estudio corporativo', category: 'letras', size: '2.4 m', material: 'Fibra de vidrio', wide: true },
  { title: 'Dinosaurio para parque infantil', client: 'Parque recreacional', category: 'tematico', size: '5 m', material: 'Fibra de vidrio', wide: true },
  { title: 'Figura de cómic a escala real', client: 'Colección privada', category: 'arte', size: '1.8 m', material: 'Resina', tall: true },
  { title: 'Mascota para activación', client: 'Marca de snacks', category: 'publicidad', size: '2.1 m', material: 'Fibra + látex' },
  { title: 'Imagen religiosa restaurada', client: 'Parroquia', category: 'arte', size: '1.4 m', material: 'Resina', tall: true },
  { title: 'Monumento conmemorativo', client: 'Gobierno regional', category: 'monumental', size: '4 m', material: 'Fibra de vidrio', tall: true },
  { title: 'Letras para fachada', client: 'Cadena de restaurantes', category: 'letras', size: '6 m', material: 'Fibra de vidrio' },
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
