import axios from 'axios'
import heroImage from './assets/hero.png'
import type { Artifact } from './types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api',
})

const commonsImage = (fileName: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=1200`

export type RegisterPayload = {
  email: string
  password: string
  role: 'buyer' | 'seller'
  first_name: string
  last_name: string
}

export const demoArtifacts: Artifact[] = [
  {
    id: 101,
    category: 1,
    category_name: 'Art',
    title: 'Japanese Pine Trees Folding Screen',
    description:
      'A calm folding screen with ink-painted pines, made for a room that values silence, shadow, and ceremony.',
    history:
      'Japanese screens divided interiors while acting as portable paintings, changing the atmosphere of a room instantly.',
    provenance: 'Wikimedia Commons open image record after Hasegawa Tohaku.',
    condition: 'good',
    price: '14800.00',
    image: commonsImage('Hasegawa Tohaku - Pine Trees (ShÅrin-zu byÅbu) - right hand screen.jpg'),
    model_3d: '/models/demo-antique.glb',
    status: 'approved',
  },
  {
    id: 102,
    category: 2,
    category_name: 'Furniture',
    title: 'French Medal Cabinet Interior',
    description:
      'A formal cabinet-room study with carved storage, old display rhythm, and the mood of a private collection.',
    history:
      'Cabinets of medals and curiosities shaped how collectors arranged small precious objects before modern museums.',
    provenance: 'Bibliotheque nationale de France public photographic record.',
    condition: 'restored',
    price: '8200.00',
    image: commonsImage('Cabinet des Medailles.jpg'),
    model_3d: '/models/demo-antique.glb',
    status: 'approved',
  },
  {
    id: 103,
    category: 3,
    category_name: 'Decor',
    title: 'Vienna Mantel Clock',
    description:
      'A compact mantel clock with an aged case, formal dial, and the quiet authority of an old study shelf.',
    history:
      'Mantel clocks became domestic status pieces, bringing precision timekeeping into salons and libraries.',
    provenance: 'Wikimedia Commons vintage clock archive.',
    condition: 'good',
    price: '2600.00',
    image: commonsImage('Vienna - Vintage Table or Mantel Clock - 0554.jpg'),
    model_3d: '/models/demo-antique.glb',
    status: 'approved',
  },
  {
    id: 104,
    category: 4,
    category_name: 'Instruments',
    title: 'The Gould Violin',
    description:
      'A refined antique violin with warm varnish, elegant curves, and a musician-object presence.',
    history:
      'Historic violins are collected as instruments, sculpture, craft evidence, and cultural memory.',
    provenance: 'Metropolitan Museum of Art open-access record.',
    condition: 'excellent',
    price: '17600.00',
    image: commonsImage('"The Gould" Violin MET DT669.jpg'),
    model_3d: '/models/demo-antique.glb',
    status: 'approved',
  },
  {
    id: 105,
    category: 5,
    category_name: 'Ceramics',
    title: 'Ming-Style Blue and White Gourd Vase',
    description:
      'A blue-and-white porcelain gourd vase with dense lotus ornament and a strong collector silhouette.',
    history:
      'Blue-and-white porcelain travelled through courts, merchants, and collectors for centuries.',
    provenance: 'Wikimedia Commons museum-style porcelain record.',
    condition: 'excellent',
    price: '5400.00',
    image: commonsImage('20241025 Gourd-Shaped Blue and White Porcelain Vase of Wanli Reign, Ming Dynasty.jpg'),
    model_3d: '/models/demo-antique.glb',
    status: 'approved',
  },
  {
    id: 106,
    category: 6,
    category_name: 'Jewelry',
    title: '18th-Century English Brooch',
    description:
      'A small English brooch with jewel-like detail, intimate scale, and cabinet-of-curiosities appeal.',
    history:
      'Brooches carried fashion, memory, rank, and sentiment in a form that could move between body and display case.',
    provenance: 'Cooper Hewitt, Smithsonian Design Museum public-domain record.',
    condition: 'good',
    price: '3200.00',
    image: commonsImage('Brooch (England), 18th century (CH 18800413).jpg'),
    model_3d: '/models/demo-antique.glb',
    status: 'approved',
  },
  {
    id: 107,
    category: 7,
    category_name: 'Manuscripts',
    title: 'Illuminated Bible Leaf',
    description:
      'A richly colored manuscript leaf with medieval figures, script blocks, and devotional page architecture.',
    history:
      'Illuminated manuscripts joined text, pigment, gold, ritual, and handwork before printed books became dominant.',
    provenance: 'Bibliotheque nationale de France public-domain manuscript image.',
    condition: 'good',
    price: '9100.00',
    image: commonsImage('Grande Bible historiale complÃ©tÃ©e - BNF Fr159 f3r (TrinitÃ©).jpg'),
    model_3d: '/models/demo-antique.glb',
    status: 'approved',
  },
  {
    id: 108,
    category: 8,
    category_name: 'Silver',
    title: 'Japanese Silver Teapot and Strainer',
    description:
      'A silver teapot set with old-metal glow, ceremonial proportion, and refined table presence.',
    history:
      'Silver tea objects moved between hospitality, ritual, display, and domestic prestige.',
    provenance: 'Wikimedia Commons silver object record.',
    condition: 'restored',
    price: '4700.00',
    image: commonsImage('Japansk silvertekanna med dito sil.jpg'),
    model_3d: '/models/demo-antique.glb',
    status: 'approved',
  },
  {
    id: 109,
    category: 9,
    category_name: 'Textiles',
    title: 'Ardabil Carpet Study',
    description:
      'A grand historic carpet study with medallion geometry, deep ornament, and architectural textile presence.',
    history:
      'Court carpets shaped how collectors understood scale, symmetry, color, and room atmosphere.',
    provenance: 'Wikimedia Commons open image record.',
    condition: 'good',
    price: '12200.00',
    image: commonsImage('Ardabil Carpet.jpg'),
    model_3d: '/models/demo-antique.glb',
    status: 'approved',
  },
  {
    id: 110,
    category: 10,
    category_name: 'Lighting',
    title: 'Gilt-Bronze Argand Lamp',
    description:
      'An early Argand lamp in gilt bronze, made for formal interiors before modern electric lighting.',
    history:
      'Argand lamps were prized in the 19th century for a brighter and steadier flame.',
    provenance: 'Metropolitan Museum of Art open-access record.',
    condition: 'restored',
    price: '6800.00',
    image: commonsImage('Argand Lamp MET ADA3409.jpg'),
    model_3d: '/models/demo-antique.glb',
    status: 'approved',
  },
  {
    id: 111,
    category: 11,
    category_name: 'Fashion',
    title: 'Robe a la Francaise Court Dress',
    description:
      'An 18th-century court dress silhouette with sculptural volume, textile richness, and formal drama.',
    history:
      'Robe a la Francaise gowns turned clothing into architecture through side hoops, drape, and courtly fabric.',
    provenance: 'Metropolitan Museum of Art open-access costume record.',
    condition: 'fair',
    price: '7600.00',
    image: commonsImage('Robe Ã  la FranÃ§aise MET DP156536.jpg'),
    model_3d: '/models/demo-antique.glb',
    status: 'approved',
  },
  {
    id: 112,
    category: 12,
    category_name: 'Furniture',
    title: 'Arts and Crafts Oak Cabinet',
    description:
      'An Arts and Crafts cabinet with disciplined geometry, sturdy oak construction, and museum-grade presence.',
    history:
      'Stickley furniture helped define American Arts and Crafts interiors in the early 20th century.',
    provenance: 'Metropolitan Museum of Art open-access record.',
    condition: 'excellent',
    price: '9500.00',
    image: commonsImage('Cabinet MET 210485.jpg'),
    model_3d: '/models/demo-antique.glb',
    status: 'approved',
  },
  {
    id: 113,
    category: 13,
    category_name: 'Art',
    title: 'Grand Tour Landscape Study',
    description:
      'A delicate landscape work with pale sky, distant shoreline, and the softness of an old travel album.',
    history:
      'Grand Tour landscapes preserved views, memory, and status for collectors returning from Europe.',
    provenance: 'European works-on-paper archive.',
    condition: 'good',
    price: '6100.00',
    image:
      'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?auto=format&fit=crop&w=1200&q=85',
    model_3d: '/models/demo-antique.glb',
    status: 'approved',
  },
  {
    id: 114,
    category: 14,
    category_name: 'Decor',
    title: 'Antique Collector Clock',
    description:
      'A dark antique clock with worn surfaces, visible age, and the feeling of a collector shop discovery.',
    history:
      'Small clocks carried timekeeping into studies, bedrooms, counters, and personal collections.',
    provenance: 'Wikimedia Commons antique clock archive.',
    condition: 'fair',
    price: '1900.00',
    image: commonsImage('Antique clock in Katowice shop.JPG'),
    model_3d: '/models/demo-antique.glb',
    status: 'approved',
  },
]

export const fallbackArtifactImage = heroImage

export async function getArtifacts() {
  const response = await api.get<Artifact[]>('/artifacts/')
  return response.data
}

export async function getArtifact(id: string) {
  const response = await api.get<Artifact>(`/artifacts/${id}/`)
  return response.data
}

export async function registerUser(payload: RegisterPayload) {
  const response = await api.post('/auth/register/', payload)
  return response.data
}
