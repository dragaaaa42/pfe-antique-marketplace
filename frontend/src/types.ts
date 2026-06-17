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
