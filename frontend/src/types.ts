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

export type SellerDashboardSummary = {
  stats: {
    total_listings: number
    published_listings: number
    pending_listings: number
    sold_listings: number
    total_galleries: number
  }
  recent_artifacts: Artifact[]
  recent_galleries: Gallery[]
}
