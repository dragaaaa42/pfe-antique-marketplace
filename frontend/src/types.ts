export type Artifact = {
  id: number
  seller?: number
  seller_email?: string
  category: number
  category_name?: string
  title: string
  description: string
  history?: string
  provenance?: string
  materials?: string
  dimensions?: string
  condition: string
  price: string
  image?: string
  model_3d?: string
  textures_path?: string
  metadata_json?: Record<string, unknown>
  status: string
  created_at?: string
}

export type Category = {
  id: number
  name: string
  description: string
}

export type Gallery = {
  id: number
  owner?: number
  owner_email?: string
  name: string
  theme: string
  description: string
  layout_3d_path: string
  is_public: boolean
  created_at?: string
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

export type UserProfileSummary = {
  id: number
  email: string
  first_name: string
  last_name: string
  role: 'buyer' | 'seller' | 'admin'
  avatar_3d_path: string
  created_at: string | null
}

export type AdminUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  date_joined: string
  role: 'buyer' | 'seller' | 'admin'
  profile_created_at?: string
}

export type ModerationActionType =
  | 'artifact_approved'
  | 'artifact_rejected'
  | 'artifact_deleted'
  | 'gallery_deleted'
  | 'user_role_changed'
  | 'user_disabled'
  | 'user_enabled'

export type ModerationAction = {
  id: number
  admin: number
  admin_email: string
  action_type: ModerationActionType
  target_model: string
  target_id: number
  target_label: string
  notes: string
  metadata_json: Record<string, unknown>
  created_at: string
}

export type SellerDashboardSummary = {
  stats: {
    total_listings: number
    published_listings: number
    pending_listings: number
    sold_listings: number
    total_galleries: number
    total_sales: number
    revenue: string
    sold_artifacts: number
  }
  recent_artifacts: Artifact[]
  recent_galleries: Gallery[]
  recent_orders: SellerOrderRecord[]
}

export type SellerOrderRecord = {
  id: number
  buyer: number
  buyer_email: string
  buyer_first_name: string
  buyer_last_name: string
  total_amount: string
  status: 'pending' | 'paid' | 'failed' | 'cancelled'
  created_at: string
  items: OrderItem[]
  seller_revenue: string
}

export type CollectorDashboardSummary = {
  stats: {
    wishlist_count: number
    cart_count: number
    order_count: number
    paid_orders: number
  }
  profile: UserProfileSummary
  wishlist_items: WishlistItem[]
  recent_orders: OrderRecord[]
  recent_activity: Array<{
    kind: 'wishlist' | 'order'
    label: string
    detail: string
    created_at: string
  }>
}

export type AdminDashboardSummary = {
  stats: {
    total_users: number
    total_sellers: number
    total_artifacts: number
    total_galleries: number
    total_orders: number
    pending_artifacts: number
    published_artifacts: number
  }
  recent_users: AdminUser[]
  pending_artifacts: Artifact[]
  recent_galleries: Gallery[]
  recent_actions: ModerationAction[]
}
