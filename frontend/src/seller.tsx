import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import {
  createSellerArtifact,
  createSellerGallery,
  deleteSellerArtifact,
  deleteSellerGallery,
  fallbackArtifactImage,
  getCategories,
  getSellerArtifacts,
  getSellerDashboardSummary,
  getSellerGalleries,
  updateSellerArtifact,
  updateSellerGallery,
} from './api'
import { useAuth } from './auth'
import type { Artifact, Gallery } from './types'

function formatPrice(value: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function SellerGate({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { status, user } = useAuth()

  if (status === 'loading') {
    return (
      <main className="empty-page">
        <section className="empty-card">
          <p className="eyebrow">Seller access</p>
          <h1>Loading seller workspace...</h1>
        </section>
      </main>
    )
  }

  if (!user) {
    return <Navigate replace state={{ redirectTo: location.pathname }} to="/login" />
  }

  if (user.role !== 'seller' && user.role !== 'admin') {
    return (
      <main className="empty-page">
        <section className="empty-card">
          <p className="eyebrow">Access denied</p>
          <h1>This area is only for sellers.</h1>
          <p>Collectors can continue browsing the public catalogue.</p>
          <Link className="solid-button" to="/">
            Return to catalogue
          </Link>
        </section>
      </main>
    )
  }

  return children
}

function SellerLayout({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  const { user, logout } = useAuth()

  return (
    <main className="dashboard-page">
      <aside className="dashboard-rail">
        <Link className="brand-mark" to="/">
          Artisan&apos;s Echo
        </Link>
        <div className="dashboard-user">
          <strong>{user?.first_name || user?.email}</strong>
          <span>{user?.role}</span>
          <p>{description}</p>
        </div>
        <nav className="dashboard-nav" aria-label="Seller navigation">
          <Link to="/seller">Dashboard</Link>
          <Link to="/seller/products">Products</Link>
          <Link to="/seller/galleries">Galleries</Link>
          <Link to="/">Catalogue</Link>
        </nav>
        <button className="ghost-button" onClick={logout} type="button">
          Log out
        </button>
      </aside>
      <section className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <p className="eyebrow">Seller workspace</p>
            <h1>{title}</h1>
          </div>
          <Link className="ghost-button" to="/">
            Back to catalogue
          </Link>
        </div>
        {children}
      </section>
    </main>
  )
}

function useSellerData<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')

    try {
      const result = await loader()
      setData(result)
    } catch {
      setError('Unable to load seller workspace right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  return { data, setData, loading, error, refresh, setError }
}

function SellerDashboardBody() {
  const { data, loading, error, refresh } = useSellerData(getSellerDashboardSummary)

  return (
    <SellerLayout
      description="Track inventory, manage gallery spaces, and keep the seller catalog organized."
      title="Dashboard"
    >
      <div className="panel-card">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Seller stats</p>
            <h2>Workspace overview</h2>
          </div>
          <button className="ghost-button" onClick={() => void refresh()} type="button">
            Refresh
          </button>
        </div>
        {loading && <p>Loading seller dashboard...</p>}
        {error && <p className="error-message">{error}</p>}
        {data && (
          <>
            <div className="metric-row">
              <article>
                <strong>{data.stats.total_listings}</strong>
                <span>Total listings</span>
              </article>
              <article>
                <strong>{data.stats.published_listings}</strong>
                <span>Published listings</span>
              </article>
              <article>
                <strong>{data.stats.pending_listings}</strong>
                <span>Pending listings</span>
              </article>
              <article>
                <strong>{data.stats.sold_listings}</strong>
                <span>Sold listings</span>
              </article>
            </div>
            <div className="panel-card">
              <strong>Total galleries: {data.stats.total_galleries}</strong>
            </div>
            <div className="dashboard-grid">
              <section className="panel-card">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Recent listings</p>
                    <h3>Latest artifacts</h3>
                  </div>
                  <Link className="text-link" to="/seller/products">
                    Manage products
                  </Link>
                </div>
                <div className="manage-list">
                  {data.recent_artifacts.map((artifact) => (
                    <article className="manage-card" key={artifact.id}>
                      <img alt={artifact.title} src={artifact.image || fallbackArtifactImage} />
                      <div>
                        <strong>{artifact.title}</strong>
                        <span>{artifact.category_name ?? 'Uncategorized'}</span>
                        <p>{formatPrice(artifact.price)}</p>
                      </div>
                      <span className={`status-pill status-${artifact.status}`}>{artifact.status}</span>
                    </article>
                  ))}
                </div>
              </section>
              <section className="panel-card">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Recent galleries</p>
                    <h3>Gallery spaces</h3>
                  </div>
                  <Link className="text-link" to="/seller/galleries">
                    Manage galleries
                  </Link>
                </div>
                <div className="manage-list">
                  {data.recent_galleries.map((gallery) => (
                    <article className="validation-card" key={gallery.id}>
                      <div>
                        <strong>{gallery.name}</strong>
                        <span>{gallery.theme || 'No theme'}</span>
                      </div>
                      <span>{gallery.is_public ? 'Public' : 'Private'}</span>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </SellerLayout>
  )
}

type ArtifactFormState = {
  category: string
  title: string
  description: string
  history: string
  provenance: string
  condition: Artifact['condition']
  price: string
}

const defaultArtifactFormState: ArtifactFormState = {
  category: '',
  title: '',
  description: '',
  history: '',
  provenance: '',
  condition: 'good',
  price: '',
}

function SellerProductsBody() {
  const { data: categories, loading: categoriesLoading } = useSellerData(getCategories)
  const { data: artifacts, loading, error, refresh } = useSellerData(getSellerArtifacts)
  const [editingArtifactId, setEditingArtifactId] = useState<number | null>(null)
  const [form, setForm] = useState<ArtifactFormState>(defaultArtifactFormState)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const selectedArtifact = useMemo(
    () => artifacts?.find((item) => item.id === editingArtifactId) ?? null,
    [artifacts, editingArtifactId],
  )

  useEffect(() => {
    if (selectedArtifact) {
      setForm({
        category: String(selectedArtifact.category),
        title: selectedArtifact.title,
        description: selectedArtifact.description,
        history: selectedArtifact.history || '',
        provenance: selectedArtifact.provenance || '',
        condition: selectedArtifact.condition as Artifact['condition'],
        price: selectedArtifact.price,
      })
      return
    }

    if (categories && categories.length > 0 && !form.category) {
      setForm((current) => ({
        ...current,
        category: String(categories[0].id),
      }))
    }
  }, [selectedArtifact, categories])

  function resetForm() {
    setEditingArtifactId(null)
    setForm((current) => ({
      ...defaultArtifactFormState,
      category: current.category || String(categories?.[0]?.id ?? ''),
    }))
    setImageFile(null)
    setModelFile(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const payload = new FormData()
      payload.append('category', form.category)
      payload.append('title', form.title)
      payload.append('description', form.description)
      payload.append('history', form.history)
      payload.append('provenance', form.provenance)
      payload.append('condition', form.condition)
      payload.append('price', form.price)
      if (imageFile) {
        payload.append('image', imageFile)
      }
      if (modelFile) {
        payload.append('model_3d', modelFile)
      }

      if (editingArtifactId) {
        await updateSellerArtifact(editingArtifactId, payload)
        setMessage('Listing updated.')
      } else {
        await createSellerArtifact(payload)
        setMessage('Listing created.')
      }

      setStatus('success')
      resetForm()
      await refresh()
    } catch {
      setStatus('error')
      setMessage('Unable to save this product right now.')
    }
  }

  async function handleDelete(id: number) {
    await deleteSellerArtifact(id)
    if (editingArtifactId === id) {
      resetForm()
    }
    await refresh()
  }

  return (
    <SellerLayout
      description="Create, edit, or delete antique listings that belong to your own seller account."
      title="Products"
    >
      <div className="panel-card">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Product management</p>
            <h2>{editingArtifactId ? 'Edit listing' : 'Create listing'}</h2>
          </div>
          <button className="ghost-button" onClick={resetForm} type="button">
            New listing
          </button>
        </div>

        <form className="editor-card" onSubmit={handleSubmit}>
          <div className="editor-grid">
            <label>
              Category
              <select
                required
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                disabled={categoriesLoading}
              >
                <option value="">Select category</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Condition
              <select
                value={form.condition}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    condition: event.target.value as Artifact['condition'],
                  }))
                }
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="restored">Restored</option>
              </select>
            </label>
            <label>
              Title
              <input
                required
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              />
            </label>
            <label>
              Price
              <input
                min={0}
                required
                step="0.01"
                type="number"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
              />
            </label>
          </div>
          <label>
            Description
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>
          <div className="editor-grid">
            <label>
              History
              <textarea
                rows={4}
                value={form.history}
                onChange={(event) => setForm((current) => ({ ...current, history: event.target.value }))}
              />
            </label>
            <label>
              Provenance
              <textarea
                rows={4}
                value={form.provenance}
                onChange={(event) => setForm((current) => ({ ...current, provenance: event.target.value }))}
              />
            </label>
          </div>
          <div className="editor-grid">
            <label>
              Image upload
              <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} />
            </label>
            <label>
              3D model upload
              <input
                type="file"
                accept=".glb,.gltf"
                onChange={(event) => setModelFile(event.target.files?.[0] ?? null)}
              />
            </label>
          </div>
          <div className="editor-actions">
            <button className="solid-button" disabled={status === 'loading'} type="submit">
              {status === 'loading'
                ? 'Saving...'
                : editingArtifactId
                  ? 'Update listing'
                  : 'Create listing'}
            </button>
            <button className="ghost-button" onClick={resetForm} type="button">
              Clear form
            </button>
          </div>
        </form>

        {message && (
          <p className={status === 'error' ? 'error-message' : 'success-message'}>{message}</p>
        )}

        {loading && <p>Loading listings...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && artifacts && artifacts.length === 0 && (
          <div className="empty-card">
            <h3>No listings yet</h3>
            <p>Create your first product from the form above.</p>
          </div>
        )}

        <div className="manage-list">
          {artifacts?.map((artifact) => (
            <article className="manage-card" key={artifact.id}>
              <img alt={artifact.title} src={artifact.image || fallbackArtifactImage} />
              <div>
                <strong>{artifact.title}</strong>
                <span>{artifact.category_name ?? 'Uncategorized'}</span>
                <p>{formatPrice(artifact.price)}</p>
              </div>
              <div className="manage-actions">
                <span className={`status-pill status-${artifact.status}`}>{artifact.status}</span>
                <button
                  className="ghost-button"
                  onClick={() => setEditingArtifactId(artifact.id)}
                  type="button"
                >
                  Edit
                </button>
                <button className="ghost-button" onClick={() => void handleDelete(artifact.id)} type="button">
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </SellerLayout>
  )
}

type GalleryFormState = Pick<Gallery, 'name' | 'theme' | 'description' | 'layout_3d_path' | 'is_public'>

const defaultGalleryFormState: GalleryFormState = {
  name: '',
  theme: '',
  description: '',
  layout_3d_path: '',
  is_public: true,
}

function SellerGalleriesBody() {
  const { data: galleries, loading, error, refresh } = useSellerData(getSellerGalleries)
  const [editingGalleryId, setEditingGalleryId] = useState<number | null>(null)
  const [form, setForm] = useState<GalleryFormState>(defaultGalleryFormState)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const selectedGallery = useMemo(
    () => galleries?.find((item) => item.id === editingGalleryId) ?? null,
    [galleries, editingGalleryId],
  )

  useEffect(() => {
    if (selectedGallery) {
      setForm({
        name: selectedGallery.name,
        theme: selectedGallery.theme || '',
        description: selectedGallery.description || '',
        layout_3d_path: selectedGallery.layout_3d_path || '',
        is_public: selectedGallery.is_public,
      })
    }
  }, [selectedGallery])

  function resetForm() {
    setEditingGalleryId(null)
    setForm(defaultGalleryFormState)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      if (editingGalleryId) {
        await updateSellerGallery(editingGalleryId, form)
        setMessage('Gallery updated.')
      } else {
        await createSellerGallery(form)
        setMessage('Gallery created.')
      }

      setStatus('success')
      resetForm()
      await refresh()
    } catch {
      setStatus('error')
      setMessage('Unable to save this gallery right now.')
    }
  }

  async function handleDelete(id: number) {
    await deleteSellerGallery(id)
    if (editingGalleryId === id) {
      resetForm()
    }
    await refresh()
  }

  return (
    <SellerLayout
      description="Create and manage gallery spaces for your approved antique collections."
      title="Galleries"
    >
      <div className="panel-card">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Gallery management</p>
            <h2>{editingGalleryId ? 'Edit gallery' : 'Create gallery'}</h2>
          </div>
          <button className="ghost-button" onClick={resetForm} type="button">
            New gallery
          </button>
        </div>

        <form className="editor-card" onSubmit={handleSubmit}>
          <div className="editor-grid">
            <label>
              Name
              <input
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label>
              Theme
              <input
                value={form.theme}
                onChange={(event) => setForm((current) => ({ ...current, theme: event.target.value }))}
              />
            </label>
          </div>
          <label>
            Description
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>
          <div className="editor-grid">
            <label>
              3D layout path
              <input
                value={form.layout_3d_path}
                onChange={(event) =>
                  setForm((current) => ({ ...current, layout_3d_path: event.target.value }))
                }
              />
            </label>
            <label>
              Public gallery
              <select
                value={String(form.is_public)}
                onChange={(event) =>
                  setForm((current) => ({ ...current, is_public: event.target.value === 'true' }))
                }
              >
                <option value="true">Public</option>
                <option value="false">Private</option>
              </select>
            </label>
          </div>
          <div className="editor-actions">
            <button className="solid-button" disabled={status === 'loading'} type="submit">
              {status === 'loading'
                ? 'Saving...'
                : editingGalleryId
                  ? 'Update gallery'
                  : 'Create gallery'}
            </button>
            <button className="ghost-button" onClick={resetForm} type="button">
              Clear form
            </button>
          </div>
        </form>

        {message && (
          <p className={status === 'error' ? 'error-message' : 'success-message'}>{message}</p>
        )}

        {loading && <p>Loading galleries...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && galleries && galleries.length === 0 && (
          <div className="empty-card">
            <h3>No galleries yet</h3>
            <p>Create your first gallery from the form above.</p>
          </div>
        )}

        <div className="manage-list">
          {galleries?.map((gallery) => (
            <article className="validation-card" key={gallery.id}>
              <div>
                <strong>{gallery.name}</strong>
                <span>{gallery.theme || 'No theme'}</span>
                <p>{gallery.description}</p>
              </div>
              <div className="manage-actions">
                <span>{gallery.is_public ? 'Public' : 'Private'}</span>
                <button
                  className="ghost-button"
                  onClick={() => setEditingGalleryId(gallery.id)}
                  type="button"
                >
                  Edit
                </button>
                <button className="ghost-button" onClick={() => void handleDelete(gallery.id)} type="button">
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </SellerLayout>
  )
}

export function SellerDashboardPage() {
  return (
    <SellerGate>
      <SellerDashboardBody />
    </SellerGate>
  )
}

export function SellerProductsPage() {
  return (
    <SellerGate>
      <SellerProductsBody />
    </SellerGate>
  )
}

export function SellerGalleriesPage() {
  return (
    <SellerGate>
      <SellerGalleriesBody />
    </SellerGate>
  )
}
