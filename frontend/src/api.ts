import axios from 'axios'
import amazighJewelryImage from './assets/marketplace/amazigh-jewelry.jpg'
import amazighArtworkImage from './assets/marketplace/amazigh-necklace.jpg'
import antiqueTelephoneImage from './assets/marketplace/antique-telephone.jpg'
import ceramicVaseImage from './assets/marketplace/ceramic-vase.jpg'
import chronicleLeafImage from './assets/marketplace/chronicle-leaf.jpg'
import chronographWatchImage from './assets/marketplace/chronograph-watch.jpg'
import classicalBustImage from './assets/marketplace/classical-bust.jpg'
import luxuryBagImage from './assets/marketplace/luxury-bag.jpg'
import moroccanRugImage from './assets/marketplace/moroccan-rug.jpg'
import royalCarouselImage from './assets/marketplace/royal-carousel.jpg'
import silverTeaServiceImage from './assets/marketplace/silver-tea-service.jpg'
import traditionalCaftanImage from './assets/marketplace/traditional-caftan.jpg'
import walnutCabinetImage from './assets/marketplace/walnut-cabinet.jpg'
import type {
  ConversationDetail,
  ConversationSummary,
  CollectorDashboardSummary,
  AdminDashboardSummary,
  AdminUser,
  Artifact,
  Category,
  Gallery,
  ModerationAction,
  SellerDashboardSummary,
  SellerOrderRecord,
} from './types'

const apiBaseURL = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api').replace(/\/$/, '')

const api = axios.create({
  baseURL: apiBaseURL,
})

const authStorageKey = 'artisan-echo-auth'

export type AuthUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: 'buyer' | 'seller' | 'admin'
  is_active?: boolean
  profile?: {
    role: 'buyer' | 'seller' | 'admin'
    avatar_3d_path: string
    created_at: string
  }
}

export type AuthSession = {
  access: string
  refresh: string
  user: AuthUser
}

export type LoginPayload = {
  email: string
  password: string
}

export type SocialAuthProvider = 'google' | 'github'
export type SocialAuthMode = 'login' | 'signup'

export type RegisterPayload = {
  email: string
  password: string
  role: 'buyer' | 'seller'
  first_name: string
  last_name: string
}

export type CurrentUserUpdatePayload = {
  email?: string
  first_name?: string
  last_name?: string
  avatar_3d_path?: string
  avatar_image?: File | null
  remove_avatar?: boolean
}

export type ChangePasswordPayload = {
  current_password: string
  new_password: string
  confirm_password: string
}

export type WishlistItem = {
  id: number
  user: number
  artifact: number
  artifact_detail: Artifact
  created_at: string
}

export type CartItem = {
  id: number
  user: number
  artifact: number
  artifact_detail: Artifact
  quantity: number
  subtotal: string
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: number
  order: number
  artifact: number
  artifact_detail: Artifact
  artifact_title: string
  quantity: number
  price: string
  subtotal: string
}

export type OrderRecord = {
  id: number
  buyer: number
  buyer_email: string
  total_amount: string
  status: 'pending' | 'paid' | 'failed' | 'cancelled'
  created_at: string
  items: OrderItem[]
}

export type AdminUserUpdatePayload = Partial<Pick<AdminUser, 'email' | 'first_name' | 'last_name' | 'is_active'>> & {
  role?: AdminUser['role']
}

export type AdminUserListParams = {
  search?: string
  role?: AdminUser['role'] | ''
  is_active?: boolean | ''
}

export type AdminArtifactListParams = {
  status?: string
  search?: string
}

export type AdminGalleryListParams = {
  search?: string
  is_public?: boolean | ''
}

export type AdminAuditListParams = {
  action_type?: ModerationAction['action_type'] | ''
  search?: string
}

export type ConversationListParams = {
  artifact?: number | string
}

function persistAuthSession(session: AuthSession | null) {
  if (session) {
    localStorage.setItem(authStorageKey, JSON.stringify(session))
    api.defaults.headers.common.Authorization = `Bearer ${session.access}`
    return
  }

  localStorage.removeItem(authStorageKey)
  delete api.defaults.headers.common.Authorization
}

export function loadAuthSession() {
  if (typeof window === 'undefined') {
    return null
  }

  const rawSession = window.localStorage.getItem(authStorageKey)
  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession) as AuthSession
  } catch {
    window.localStorage.removeItem(authStorageKey)
    return null
  }
}

export function saveAuthSession(session: AuthSession) {
  if (typeof window === 'undefined') {
    return
  }

  persistAuthSession(session)
}

export function clearAuthSession() {
  if (typeof window === 'undefined') {
    return
  }

  persistAuthSession(null)
}

export function applyAccessToken(accessToken: string | null) {
  if (accessToken) {
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`
    return
  }

  delete api.defaults.headers.common.Authorization
}

export function buildSocialAuthStartUrl(
  provider: SocialAuthProvider,
  options: {
    mode: SocialAuthMode
    role?: RegisterPayload['role']
    redirectTo?: string
  },
) {
  const params = new URLSearchParams({
    mode: options.mode,
  })

  if (options.role) {
    params.set('role', options.role)
  }

  if (options.redirectTo) {
    params.set('redirect_to', options.redirectTo)
  }

  return `${apiBaseURL}/auth/social/${provider}/start/?${params.toString()}`
}

export const demoArtifacts: Artifact[] = [
  {
    id: 101,
    category: 1,
    category_name: 'Luxury Bags',
    title: 'Ivory Suede Evening Bag',
    description:
      'A structured evening bag in ivory suede with a polished clasp, refined proportions, and collector-level condition.',
    history:
      'Luxury handbags became status objects through craftsmanship, materials, and the houses that shaped modern fashion history.',
    provenance: 'Private collection demo record.',
    condition: 'excellent',
    price: '3200.00',
    image: luxuryBagImage,
    status: 'approved',
  },
  {
    id: 102,
    category: 2,
    category_name: 'Jewelry',
    title: 'Diamond Floral Bracelet',
    description:
      'A floral diamond bracelet with bright stones, delicate settings, and an elegant silhouette for formal dressing.',
    history:
      'Fine jewelry carries family history, gifting rituals, and the precision of hand-set stones.',
    provenance: 'Estate jewelry demo record.',
    condition: 'excellent',
    price: '14800.00',
    image: amazighJewelryImage,
    status: 'approved',
  },
  {
    id: 103,
    category: 3,
    category_name: 'Watches',
    title: 'Sterling Chronograph Watch',
    description:
      'A vintage chronograph watch with a clean dial, brushed case, and the restrained luxury of a true collector timepiece.',
    history:
      'Mechanical watches combine precision engineering with the language of status and daily ritual.',
    provenance: 'Watch collector demo record.',
    condition: 'restored',
    price: '8600.00',
    image: chronographWatchImage,
    status: 'approved',
  },
  {
    id: 104,
    category: 4,
    category_name: 'Traditional Clothing',
    title: 'Embroidered Silk Caftan',
    description:
      'A ceremonial silk caftan with detailed embroidery, fluid drape, and the kind of textile presence collectors appreciate.',
    history:
      'Traditional dress preserves regional identity through weave, cut, ornament, and ceremonial use.',
    provenance: 'Textile archive demo record.',
    condition: 'good',
    price: '5400.00',
    image: traditionalCaftanImage,
    status: 'approved',
  },
  {
    id: 105,
    category: 5,
    category_name: 'Antique Furniture',
    title: 'Walnut Display Cabinet',
    description:
      'A walnut display cabinet with glazed doors, tapered legs, and a warm patina suited to serious interiors.',
    history:
      'Cabinets and vitrines have long been used to stage objects and signal collecting taste.',
    provenance: 'Private collection demo record.',
    condition: 'restored',
    price: '12400.00',
    image: walnutCabinetImage,
    status: 'approved',
  },
  {
    id: 106,
    category: 6,
    category_name: 'Paintings and Artwork',
    title: 'Grand Tour Landscape Painting',
    description:
      'A softly lit landscape with classical atmosphere, ideal for a room anchored by refined wall art.',
    history:
      'Landscape painting captured travel, memory, and cultivated taste for collectors across generations.',
    provenance: 'Works on paper demo record.',
    condition: 'good',
    price: '11200.00',
    image: amazighArtworkImage,
    status: 'approved',
  },
  {
    id: 107,
    category: 7,
    category_name: 'Sculptures',
    title: 'Marble Classical Bust',
    description:
      'A marble bust with crisp carving, balanced scale, and the dignified presence of a gallery centerpiece.',
    history:
      'Sculptural portraiture preserves form and status while carrying the memory of classical collecting.',
    provenance: 'Museum-quality sculpture demo record.',
    condition: 'excellent',
    price: '18900.00',
    image: classicalBustImage,
    status: 'approved',
  },
  {
    id: 108,
    category: 8,
    category_name: 'Decorative Objects',
    title: 'Gilt Mantel Clock',
    description:
      'A gilt mantel clock with decorative ornament, aged brass tone, and an elegant profile for a curated shelf.',
    history:
      'Decorative objects add rhythm and atmosphere to interiors while often becoming family keepsakes.',
    provenance: 'Antique clock demo record.',
    condition: 'fair',
    price: '3800.00',
    image: royalCarouselImage,
    status: 'approved',
  },
  {
    id: 109,
    category: 9,
    category_name: 'Vintage Collectibles',
    title: 'Leica Rangefinder Camera',
    description:
      'A vintage rangefinder camera with a clean black finish, collector appeal, and compact mechanical character.',
    history:
      'Vintage collectibles are valued for design, nostalgia, and the way they document an era of making.',
    provenance: 'Photography collectible demo record.',
    condition: 'good',
    price: '7200.00',
    image: antiqueTelephoneImage,
    status: 'approved',
  },
  {
    id: 110,
    category: 10,
    category_name: 'Historical Artifacts',
    title: 'Illuminated Chronicle Leaf',
    description:
      'A historic manuscript leaf with pigment, script, and ornamental framing that feels unmistakably archival.',
    history:
      'Historical artifacts preserve the texture of daily life, learning, and belief across centuries.',
    provenance: 'Archival study demo record.',
    condition: 'good',
    price: '9800.00',
    image: chronicleLeafImage,
    status: 'approved',
  },
  {
    id: 111,
    category: 11,
    category_name: 'Ceramics',
    title: 'Blue and White Porcelain Vase',
    description:
      'A blue and white porcelain vase with a tall silhouette, luminous glaze, and refined decorative patterning.',
    history:
      'Ceramics travel well through trade and collecting because they preserve both craft and cultural exchange.',
    provenance: 'Porcelain collection demo record.',
    condition: 'excellent',
    price: '6200.00',
    image: ceramicVaseImage,
    status: 'approved',
  },
  {
    id: 112,
    category: 12,
    category_name: 'Rugs and Textiles',
    title: 'Ardabil Carpet',
    description:
      'A museum-scale carpet with rich geometry, deep color, and the layered presence of a significant textile.',
    history:
      'Rugs and textiles introduce scale, warmth, and pattern while reflecting trade routes and household taste.',
    provenance: 'Textile collection demo record.',
    condition: 'good',
    price: '16400.00',
    image: moroccanRugImage,
    status: 'approved',
  },
  {
    id: 113,
    category: 13,
    category_name: 'Silverware',
    title: 'Sterling Silver Tea Service',
    description:
      'A polished silver tea service with crisp handles, reflective surfaces, and the ceremonial feel of formal entertaining.',
    history:
      'Silverware was often created for hospitality, display, and the ritual of hosting with style.',
    provenance: 'Silver service demo record.',
    condition: 'restored',
    price: '9400.00',
    image: silverTeaServiceImage,
    status: 'approved',
  },
]

export const fallbackArtifactImage =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

export async function getArtifacts() {
  const response = await api.get<Artifact[]>('/artifacts/')
  return response.data
}

export async function getCategories() {
  const response = await api.get<Category[]>('/categories/')
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

export async function loginUser(payload: LoginPayload) {
  const response = await api.post<AuthSession>('/auth/login/', payload)
  return response.data
}

export async function refreshAccessToken(refresh: string) {
  const response = await api.post<{ access: string }>('/auth/token/refresh/', { refresh })
  return response.data
}

export async function getCurrentUser() {
  const response = await api.get<AuthUser>('/auth/me/')
  return response.data
}

export async function updateCurrentUser(payload: CurrentUserUpdatePayload) {
  const formData = new FormData()

  if (payload.email !== undefined) {
    formData.append('email', payload.email)
  }
  if (payload.first_name !== undefined) {
    formData.append('first_name', payload.first_name)
  }
  if (payload.last_name !== undefined) {
    formData.append('last_name', payload.last_name)
  }
  if (payload.avatar_3d_path !== undefined) {
    formData.append('avatar_3d_path', payload.avatar_3d_path)
  }
  if (payload.avatar_image) {
    formData.append('avatar_image', payload.avatar_image)
  }
  if (payload.remove_avatar) {
    formData.append('remove_avatar', 'true')
  }

  const response = await api.patch<AuthUser>('/auth/me/', formData)
  return response.data
}

export async function changePassword(payload: ChangePasswordPayload) {
  const response = await api.post('/auth/change-password/', payload)
  return response.data
}

export async function getSellerDashboardSummary() {
  const response = await api.get<SellerDashboardSummary>('/seller/dashboard/')
  return response.data
}

export async function getCollectorDashboardSummary() {
  const response = await api.get<CollectorDashboardSummary>('/collector/dashboard/')
  return response.data
}

function buildQueryString(params?: Record<string, string | number | boolean | '' | undefined>) {
  if (!params) {
    return ''
  }

  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      return
    }
    searchParams.set(key, String(value))
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export async function getAdminDashboardSummary() {
  const response = await api.get<AdminDashboardSummary>('/admin/dashboard/')
  return response.data
}

export async function getAdminUsers(params?: AdminUserListParams) {
  const response = await api.get<AdminUser[]>(`/admin/users/${buildQueryString(params)}`)
  return response.data
}

export async function getAdminUser(id: number | string) {
  const response = await api.get<AdminUser>(`/admin/users/${id}/`)
  return response.data
}

export async function updateAdminUser(id: number | string, payload: AdminUserUpdatePayload) {
  const response = await api.patch<AdminUser>(`/admin/users/${id}/`, payload)
  return response.data
}

export async function getAdminArtifacts(params?: AdminArtifactListParams) {
  const response = await api.get<Artifact[]>(`/admin/artifacts/${buildQueryString(params)}`)
  return response.data
}

export async function approveAdminArtifact(id: number | string) {
  const response = await api.post<Artifact>(`/admin/artifacts/${id}/approve/`, {})
  return response.data
}

export async function rejectAdminArtifact(id: number | string, notes = '') {
  const response = await api.post<Artifact>(`/admin/artifacts/${id}/reject/`, { notes })
  return response.data
}

export async function getAdminGalleries(params?: AdminGalleryListParams) {
  const response = await api.get<Gallery[]>(`/admin/galleries/${buildQueryString(params)}`)
  return response.data
}

export async function deleteAdminGallery(id: number | string) {
  await api.delete(`/admin/galleries/${id}/`)
}

export async function getAdminAuditTrail(params?: AdminAuditListParams) {
  const response = await api.get<ModerationAction[]>(`/admin/audit-trail/${buildQueryString(params)}`)
  return response.data
}

export async function getSellerArtifacts() {
  const response = await api.get<Artifact[]>('/seller/artifacts/')
  return response.data
}

export async function createSellerArtifact(payload: FormData) {
  const response = await api.post<Artifact>('/seller/artifacts/', payload)
  return response.data
}

export async function updateSellerArtifact(id: number, payload: FormData) {
  const response = await api.patch<Artifact>(`/seller/artifacts/${id}/`, payload)
  return response.data
}

export async function deleteSellerArtifact(id: number) {
  await api.delete(`/seller/artifacts/${id}/`)
}

export async function getSellerGalleries() {
  const response = await api.get<Gallery[]>('/seller/galleries/')
  return response.data
}

export async function getSellerOrders() {
  const response = await api.get<SellerOrderRecord[]>('/seller/orders/')
  return response.data
}

export async function getSellerOrder(id: number | string) {
  const response = await api.get<SellerOrderRecord>(`/seller/orders/${id}/`)
  return response.data
}

export async function createSellerGallery(payload: Pick<Gallery, 'name' | 'theme' | 'description' | 'layout_3d_path' | 'is_public'>) {
  const response = await api.post<Gallery>('/seller/galleries/', payload)
  return response.data
}

export async function updateSellerGallery(
  id: number,
  payload: Pick<Gallery, 'name' | 'theme' | 'description' | 'layout_3d_path' | 'is_public'>,
) {
  const response = await api.patch<Gallery>(`/seller/galleries/${id}/`, payload)
  return response.data
}

export async function deleteSellerGallery(id: number) {
  await api.delete(`/seller/galleries/${id}/`)
}

export async function getWishlist() {
  const response = await api.get<WishlistItem[]>('/wishlist/')
  return response.data
}

export async function addWishlistItem(artifact: number) {
  const response = await api.post<WishlistItem>('/wishlist/', { artifact })
  return response.data
}

export async function removeWishlistItem(id: number) {
  await api.delete(`/wishlist/${id}/`)
}

export async function getCart() {
  const response = await api.get<CartItem[]>('/cart/')
  return response.data
}

export async function addCartItem(artifact: number, quantity = 1) {
  const response = await api.post<CartItem>('/cart/', { artifact, quantity })
  return response.data
}

export async function updateCartItem(id: number, quantity: number) {
  const response = await api.patch<CartItem>(`/cart/${id}/`, { quantity })
  return response.data
}

export async function removeCartItem(id: number) {
  await api.delete(`/cart/${id}/`)
}

export async function checkoutCart() {
  const response = await api.post<OrderRecord>('/orders/checkout/', {})
  return response.data
}

export async function getOrders() {
  const response = await api.get<OrderRecord[]>('/orders/')
  return response.data
}

export async function getOrder(id: number | string) {
  const response = await api.get<OrderRecord>(`/orders/${id}/`)
  return response.data
}

export async function getConversations(params?: ConversationListParams) {
  const response = await api.get<ConversationSummary[]>(`/conversations/${buildQueryString(params)}`)
  return response.data
}

export async function getConversation(id: number | string) {
  const response = await api.get<ConversationDetail>(`/conversations/${id}/`)
  return response.data
}

export async function createConversation(artifact: number, body: string) {
  const response = await api.post<ConversationDetail>('/conversations/', { artifact, body })
  return response.data
}

export async function replyConversation(id: number | string, body: string) {
  const response = await api.post<ConversationDetail>(`/conversations/${id}/reply/`, { body })
  return response.data
}

export async function simulateOrderPayment(id: number | string, success: boolean) {
  const response = await api.post<OrderRecord>(`/orders/${id}/simulate_payment/`, { success })
  return response.data
}


