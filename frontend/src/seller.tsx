import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  createSellerArtifact,
  createSellerGallery,
  deleteSellerArtifact,
  deleteSellerGallery,
  getCategories,
  getSellerArtifacts,
  getSellerDashboardSummary,
  getSellerGalleries,
  getSellerOrder,
  getSellerOrders,
  updateSellerArtifact,
  updateSellerGallery,
} from './api'
import { useAuth } from './auth'
import { MarketplaceImage } from './components/MarketplaceImage'
import { resolveMarketplaceImage } from './marketplaceImages'
import type { Artifact, Gallery, SellerOrderRecord } from './types'

function formatPrice(value: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString()
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
          <NavLink end to="/seller">
            Dashboard
          </NavLink>
          <NavLink to="/seller/products">Products</NavLink>
          <NavLink to="/seller/orders">Orders received</NavLink>
          <NavLink to="/seller/galleries">Galleries</NavLink>
          <NavLink to="/account">Profile</NavLink>
          <NavLink to="/">Catalogue</NavLink>
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

function useSellerOrdersData() {
  const [orders, setOrders] = useState<SellerOrderRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')

    try {
      const result = await getSellerOrders()
      setOrders(result)
    } catch {
      setError('Unable to load received orders right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  return { orders, setOrders, loading, error, refresh, setError }
}

function SellerOrdersPageBody() {
  const { orders, loading, error, refresh } = useSellerOrdersData()

  return (
    <SellerLayout
      description="View orders that include your antiques and track what buyers have purchased."
      title="Orders received"
    >
      <div className="panel-card">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Seller orders</p>
            <h2>Received orders</h2>
          </div>
          <button className="ghost-button" onClick={() => void refresh()} type="button">
            Refresh
          </button>
        </div>
        {loading && <p>Loading received orders...</p>}
        {error && <p className="error-message">{error}</p>}
        <div className="table-shell">
          <table className="management-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Buyer</th>
                <th>Product</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>
                    {order.buyer_first_name || order.buyer_last_name
                      ? `${order.buyer_first_name} ${order.buyer_last_name}`.trim()
                      : order.buyer_email}
                  </td>
                  <td>{order.items.map((item) => item.artifact_title).slice(0, 2).join(', ')}</td>
                  <td>{formatPrice(order.seller_revenue)}</td>
                  <td>
                    <span className={`status-pill status-${order.status}`}>{order.status}</span>
                  </td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    <Link className="text-link" to={`/seller/orders/${order.id}`}>
                      View details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SellerLayout>
  )
}

function SellerOrderDetailPageBody() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<SellerOrderRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const result = await getSellerOrder(id)
        if (!cancelled) {
          setOrder(result)
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load this order right now.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <SellerLayout description="Inspect the order and buyer information." title="Order details">
        <div className="panel-card">
          <p>Loading order...</p>
        </div>
      </SellerLayout>
    )
  }

  if (!order) {
    return (
      <SellerLayout description="Inspect the order and buyer information." title="Order details">
        <div className="empty-card">
          <h3>Order not found</h3>
          <button className="ghost-button" onClick={() => navigate('/seller/orders')} type="button">
            Back to orders
          </button>
        </div>
      </SellerLayout>
    )
  }

  return (
    <SellerLayout description="Inspect the order and buyer information." title={`Order #${order.id}`}>
      <div className="panel-card">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Order detail</p>
            <h2>{order.status}</h2>
            <p>
              Buyer: {order.buyer_first_name || order.buyer_last_name
                ? `${order.buyer_first_name} ${order.buyer_last_name}`.trim()
                : order.buyer_email}
            </p>
          </div>
          <div>
            <strong>{formatPrice(order.seller_revenue)}</strong>
            <p>{new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}
        <div className="table-shell">
          <table className="management-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Subtotal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.artifact_title}</td>
                  <td>{item.artifact_detail.category_name ?? 'Uncategorized'}</td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.price)}</td>
                  <td>{item.subtotal}</td>
                  <td>
                    <Link className="text-link" to={`/artifacts/${item.artifact_detail.id}`}>
                      View object
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SellerLayout>
  )
}

function SellerDashboardBody() {
  const { data, loading, error, refresh } = useSellerData(getSellerDashboardSummary)

  async function handleDelete(id: number) {
    await deleteSellerArtifact(id)
    await refresh()
  }

  return (
    <SellerLayout
      description="Add product photos, edit listing information, delete products, and track what you sell."
      title="Seller dashboard"
    >
      <div className="panel-card">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Your products</p>
            <h2>Inventory overview</h2>
            <p>See your product totals here. Use product studio to add a picture, edit information, or delete a listing.</p>
          </div>
          <div className="editor-actions">
            <Link className="solid-button" to="/seller/products">
              Add product picture
            </Link>
            <button className="ghost-button" onClick={() => void refresh()} type="button">
              Refresh
            </button>
          </div>
        </div>
        {loading && <p>Loading seller dashboard...</p>}
        {error && <p className="error-message">{error}</p>}
        {data && (
          <>
            <div className="metric-row">
              <article>
                <strong>{data.stats.total_listings}</strong>
                <span>Products you have</span>
              </article>
              <article>
                <strong>{data.stats.sold_artifacts}</strong>
                <span>Products sold</span>
              </article>
              <article>
                <strong>{data.stats.total_sales}</strong>
                <span>Sales / orders</span>
              </article>
              <article>
                <strong>{formatPrice(data.stats.revenue)}</strong>
                <span>Revenue</span>
              </article>
            </div>

            <div className="metric-row compact-metrics">
              <article>
                <strong>{data.stats.published_listings}</strong>
                <span>Published</span>
              </article>
              <article>
                <strong>{data.stats.pending_listings}</strong>
                <span>Waiting approval</span>
              </article>
              <article>
                <strong>{data.stats.sold_listings}</strong>
                <span>Marked sold</span>
              </article>
              <article>
                <strong>{data.stats.total_galleries}</strong>
                <span>Galleries</span>
              </article>
            </div>

            <div className="dashboard-grid">
              <section className="panel-card simple-dashboard-panel">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Product pictures and information</p>
                    <h3>Your latest products</h3>
                  </div>
                  <Link className="text-link" to="/seller/products">
                    Add or edit products
                  </Link>
                </div>
                {data.recent_artifacts.length === 0 ? (
                  <div className="empty-card">
                    <h3>No products yet</h3>
                    <p>Add your first product picture and information from the product studio.</p>
                    <Link className="solid-button" to="/seller/products">
                      Add product
                    </Link>
                  </div>
                ) : (
                <div className="table-shell">
                  <table className="management-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_artifacts.map((artifact) => (
                        <tr key={artifact.id}>
                          <td>
                            <MarketplaceImage
                              alt={artifact.title}
                              className="table-thumb"
                              src={resolveMarketplaceImage(artifact)}
                            />
                          </td>
                          <td>
                            <strong>{artifact.title}</strong>
                            <span>{artifact.seller_email || 'Seller listing'}</span>
                          </td>
                          <td>{artifact.category_name ?? 'Uncategorized'}</td>
                          <td>{formatPrice(artifact.price)}</td>
                          <td>
                            <span className={`status-pill status-${artifact.status}`}>{artifact.status}</span>
                          </td>
                          <td>{artifact.created_at ? formatDate(artifact.created_at) : '—'}</td>
                          <td>
                            <div className="table-actions">
                              <Link className="text-link" to={`/artifacts/${artifact.id}`}>
                                Preview
                              </Link>
                              <Link className="text-link" state={{ editArtifactId: artifact.id }} to="/seller/products">
                                Edit
                              </Link>
                              <button className="text-link" onClick={() => void handleDelete(artifact.id)} type="button">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </section>

              <section className="panel-card">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Gallery spaces</p>
                    <h3>Optional galleries</h3>
                  </div>
                  <Link
                    className="text-link"
                    state={{ editGalleryId: data.recent_galleries[0]?.id }}
                    to="/seller/galleries"
                  >
                    Manage galleries
                  </Link>
                </div>
                <div className="table-shell">
                  <table className="management-table">
                    <thead>
                      <tr>
                        <th>Gallery</th>
                        <th>Description</th>
                        <th>Visibility</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_galleries.map((gallery) => (
                        <tr key={gallery.id}>
                          <td>
                            <strong>{gallery.name}</strong>
                            <span>{gallery.owner_email || 'Seller gallery'}</span>
                          </td>
                          <td>{gallery.description || 'No description'}</td>
                          <td>{gallery.is_public ? 'Public' : 'Private'}</td>
                          <td>{gallery.created_at ? formatDate(gallery.created_at) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <section className="panel-card">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">Orders received</p>
                  <h3>Recent seller orders</h3>
                </div>
                <Link className="text-link" to="/seller/orders">
                  View all orders
                </Link>
              </div>
              <div className="table-shell">
                <table className="management-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Buyer</th>
                      <th>Products</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_orders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>
                          {order.buyer_first_name || order.buyer_last_name
                            ? `${order.buyer_first_name} ${order.buyer_last_name}`.trim()
                            : order.buyer_email}
                        </td>
                        <td>{order.items.map((item) => item.artifact_title).slice(0, 2).join(', ')}</td>
                        <td>{formatPrice(order.seller_revenue)}</td>
                        <td>
                          <span className={`status-pill status-${order.status}`}>{order.status}</span>
                        </td>
                        <td>{formatDate(order.created_at)}</td>
                        <td>
                          <Link className="text-link" to={`/seller/orders/${order.id}`}>
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
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

type ListingDraftState = {
  period: string
  country: string
  materials: string
  dimensions: string
  availability: 'available' | 'reserved' | 'sold'
}

type ArtifactFormErrors = Partial<Record<'category' | 'title' | 'description' | 'price' | 'media', string>>

type DraftMediaItem = {
  id: string
  source: 'existing' | 'local'
  url: string
  file?: File
  name: string
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

const defaultListingDraftState: ListingDraftState = {
  period: '',
  country: '',
  materials: '',
  dimensions: '',
  availability: 'available',
}

function SellerProductsBody() {
  const location = useLocation()
  const locationState = location.state as { editArtifactId?: number } | null
  const { data: categories, loading: categoriesLoading } = useSellerData(getCategories)
  const { data: artifacts, loading, error, refresh } = useSellerData(getSellerArtifacts)
  const [editingArtifactId, setEditingArtifactId] = useState<number | null>(
    locationState?.editArtifactId ?? null,
  )
  const [form, setForm] = useState<ArtifactFormState>(defaultArtifactFormState)
  const [draft, setDraft] = useState<ListingDraftState>(defaultListingDraftState)
  const [mediaItems, setMediaItems] = useState<DraftMediaItem[]>([])
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<ArtifactFormErrors>({})
  const [dragActive, setDragActive] = useState(false)
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const modelInputRef = useRef<HTMLInputElement>(null)

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
      setDraft((current) => ({
        ...current,
        availability: selectedArtifact.status === 'approved' ? 'available' : current.availability,
      }))
      setMediaItems(
        selectedArtifact.image
          ? [
              {
                id: `existing-${selectedArtifact.id}`,
                source: 'existing',
                url: selectedArtifact.image,
                name: selectedArtifact.title,
              },
            ]
          : [],
      )
      return
    }

    if (categories && categories.length > 0 && !form.category) {
      setForm((current) => ({
        ...current,
        category: String(categories[0].id),
      }))
    }
  }, [selectedArtifact, categories])

  useEffect(() => {
    if (locationState?.editArtifactId && locationState.editArtifactId !== editingArtifactId) {
      setEditingArtifactId(locationState.editArtifactId)
    }
  }, [editingArtifactId, locationState])

  useEffect(() => {
    return () => {
      mediaItems.forEach((item) => {
        if (item.source === 'local') {
          URL.revokeObjectURL(item.url)
        }
      })
    }
  }, [mediaItems])

  function resetForm() {
    setEditingArtifactId(null)
    setDraft(defaultListingDraftState)
    setForm((current) => ({
      ...defaultArtifactFormState,
      category: current.category || String(categories?.[0]?.id ?? ''),
    }))
    mediaItems.forEach((item) => {
      if (item.source === 'local') {
        URL.revokeObjectURL(item.url)
      }
    })
    setMediaItems([])
    setReplaceIndex(null)
    setModelFile(null)
    setErrors({})
    setMessage('')
    setStatus('idle')
  }

  function addMediaFiles(files: FileList | File[]) {
    const images = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (images.length === 0) {
      return
    }

    const nextItems = images.map((file) => ({
      id: crypto.randomUUID(),
      source: 'local' as const,
      url: URL.createObjectURL(file),
      file,
      name: file.name,
    }))

    setMediaItems((current) => {
      if (replaceIndex !== null) {
        const next = [...current]
        const [replacement] = nextItems
        const existing = next[replaceIndex]
        if (existing?.source === 'local') {
          URL.revokeObjectURL(existing.url)
        }
        next.splice(replaceIndex, 1, replacement)
        if (nextItems.length > 1) {
          next.splice(replaceIndex + 1, 0, ...nextItems.slice(1))
        }
        return next
      }

      return [...current, ...nextItems]
    })

    setReplaceIndex(null)
  }

  function removeMediaItem(index: number) {
    setMediaItems((current) => {
      const target = current[index]
      if (target?.source === 'local') {
        URL.revokeObjectURL(target.url)
      }
      return current.filter((_, itemIndex) => itemIndex !== index)
    })
  }

  function moveMediaToFront(index: number) {
    setMediaItems((current) => {
      if (index < 0 || index >= current.length) {
        return current
      }
      const next = [...current]
      const [selected] = next.splice(index, 1)
      next.unshift(selected)
      return next
    })
  }

  function moveMediaItem(index: number, direction: -1 | 1) {
    setMediaItems((current) => {
      const nextIndex = index + direction
      if (index < 0 || index >= current.length || nextIndex < 0 || nextIndex >= current.length) {
        return current
      }

      const next = [...current]
      const [selected] = next.splice(index, 1)
      next.splice(nextIndex, 0, selected)
      return next
    })
  }

  function clearMedia() {
    mediaItems.forEach((item) => {
      if (item.source === 'local') {
        URL.revokeObjectURL(item.url)
      }
    })
    setMediaItems([])
    setReplaceIndex(null)
    setErrors((current) => ({ ...current, media: undefined }))
  }

  function validateForm() {
    const nextErrors: ArtifactFormErrors = {}

    if (!form.category) nextErrors.category = 'Choose a category.'
    if (!form.title.trim()) nextErrors.title = 'Add a clear object title.'
    if (!form.description.trim()) nextErrors.description = 'Write a concise object description.'
    if (!form.price || Number(form.price) <= 0) nextErrors.price = 'Enter a valid price.'
    if (mediaItems.length === 0) nextErrors.media = 'Add at least one hero image.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validateForm()) {
      setStatus('error')
      setMessage('Please fix the highlighted fields before publishing.')
      return
    }

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
      const primaryImage = mediaItems[0]
      if (primaryImage?.source === 'local' && primaryImage.file) {
        payload.append('image', primaryImage.file)
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
      setMessage('Unable to save this listing right now.')
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
      description="Create, edit, and preview antique listings with a studio workflow built for premium objects."
      title="Products"
    >
      <div className="panel-card seller-studio">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Listing studio</p>
            <h2>{editingArtifactId ? 'Edit listing' : 'Create listing'}</h2>
            <p className="studio-intro">
              Multi-image drafting, drag and drop upload, step-by-step sections, and a live preview before
              publish.
            </p>
          </div>
          <div className="editor-actions">
            <button className="ghost-button" onClick={resetForm} type="button">
              New listing
            </button>
            <button className="ghost-button" onClick={clearMedia} type="button">
              Clear media
            </button>
          </div>
        </div>

        <div className="studio-grid">
          <form className="editor-card studio-form" onSubmit={handleSubmit}>
            <section className="form-section">
              <div className="form-section-head">
                <div>
                  <p className="eyebrow">Step 1</p>
                  <h3>Basic information</h3>
                </div>
                <button
                  className="text-link"
                  onClick={() => {
                    setForm((current) => ({
                      ...current,
                      title: '',
                      description: '',
                    }))
                  }}
                  type="button"
                >
                  Clear section
                </button>
              </div>
              <div className="editor-grid">
                <label className={errors.category ? 'field-error' : ''}>
                  Category
                  <select
                    required
                    value={form.category}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, category: event.target.value }))
                      setErrors((current) => ({ ...current, category: undefined }))
                    }}
                    disabled={categoriesLoading}
                  >
                    <option value="">Select category</option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <span className="field-note">{errors.category}</span>}
                </label>
                <label className={errors.title ? 'field-error full-field' : 'full-field'}>
                  Title
                  <input
                    required
                    value={form.title}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, title: event.target.value }))
                      setErrors((current) => ({ ...current, title: undefined }))
                    }}
                  />
                  {errors.title && <span className="field-note">{errors.title}</span>}
                </label>
              <label className={errors.description ? 'field-error full-field' : 'full-field'}>
                Description
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, description: event.target.value }))
                    setErrors((current) => ({ ...current, description: undefined }))
                  }}
                />
                {errors.description && <span className="field-note">{errors.description}</span>}
              </label>
              </div>
            </section>

            <section className="form-section">
              <div className="form-section-head">
                <div>
                  <p className="eyebrow">Step 2</p>
                  <h3>Media</h3>
                </div>
                <button className="text-link" onClick={clearMedia} type="button">
                  Clear section
                </button>
              </div>
              <div
                className={dragActive ? 'media-dropzone active' : 'media-dropzone'}
                onDragLeave={() => setDragActive(false)}
                onDragOver={(event) => {
                  event.preventDefault()
                  setDragActive(true)
                }}
                onDrop={(event) => {
                  event.preventDefault()
                  setDragActive(false)
                  addMediaFiles(event.dataTransfer.files)
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    imageInputRef.current?.click()
                  }
                }}
              >
                <div>
                  <p className="eyebrow">Drag and drop</p>
                  <h4>Drop image files or browse from your device</h4>
                  <p>
                    Use the first image as the hero image. Reorder the gallery, replace images, and
                    keep additional uploads as live previews until the backend supports them.
                  </p>
                </div>
                <div className="media-dropzone-actions">
                  <button className="solid-button" onClick={() => imageInputRef.current?.click()} type="button">
                    Browse images
                  </button>
                  <button className="ghost-button" onClick={clearMedia} type="button">
                    Remove all
                  </button>
                </div>
              </div>
              <input
                ref={imageInputRef}
                accept="image/*"
                hidden
                multiple
                type="file"
                onChange={(event) => {
                  const files = event.target.files
                  if (files && files.length > 0) {
                    addMediaFiles(files)
                  } else {
                    setReplaceIndex(null)
                  }
                  event.target.value = ''
                }}
              />
              {errors.media && <span className="field-note">{errors.media}</span>}

              <div className="media-stage">
                {mediaItems.length > 0 ? (
                  <MarketplaceImage alt="Listing preview" className="media-stage-image" src={mediaItems[0].url} />
                ) : (
                  <div className="media-stage-placeholder">
                    <span>No hero image selected yet.</span>
                  </div>
                )}
                <div className="media-stage-meta">
                  <strong>{mediaItems[0]?.name || 'Preview before publish'}</strong>
                  <p>{mediaItems.length > 0 ? `${mediaItems.length} image(s) prepared` : 'Add a hero image first.'}</p>
                </div>
              </div>

              <div className="media-grid">
                {mediaItems.map((item, index) => (
                  <article className="media-card" key={item.id}>
                    <MarketplaceImage alt={item.name} src={item.url} />
                    <div className="media-card-body">
                      <strong>{index === 0 ? 'Hero image' : `Gallery image ${index + 1}`}</strong>
                      <span>{item.name}</span>
                      <div className="manage-actions">
                        {index !== 0 && (
                          <button className="ghost-button" onClick={() => moveMediaToFront(index)} type="button">
                            Set hero
                          </button>
                        )}
                        {index > 0 && (
                          <button className="ghost-button" onClick={() => moveMediaItem(index, -1)} type="button">
                            Move up
                          </button>
                        )}
                        {index < mediaItems.length - 1 && (
                          <button className="ghost-button" onClick={() => moveMediaItem(index, 1)} type="button">
                            Move down
                          </button>
                        )}
                        <button
                          className="ghost-button"
                          onClick={() => {
                            setReplaceIndex(index)
                            imageInputRef.current?.click()
                          }}
                          type="button"
                        >
                          Replace
                        </button>
                        <button className="ghost-button" onClick={() => removeMediaItem(index)} type="button">
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="editor-grid">
                <label>
                  3D model upload
                  <input
                    ref={modelInputRef}
                    accept=".glb,.gltf"
                    type="file"
                    onChange={(event) => setModelFile(event.target.files?.[0] ?? null)}
                  />
                </label>
                <label>
                  3D model note
                  <input
                    disabled
                    value={modelFile?.name || 'No 3D model selected'}
                    readOnly
                  />
                </label>
              </div>
            </section>

            <section className="form-section">
              <div className="form-section-head">
                <div>
                  <p className="eyebrow">Step 3</p>
                  <h3>Artifact details</h3>
                </div>
                <button
                  className="text-link"
                  onClick={() => {
                    setDraft(defaultListingDraftState)
                    setForm((current) => ({
                      ...current,
                      history: '',
                      provenance: '',
                      condition: 'good',
                    }))
                  }}
                  type="button"
                >
                  Clear section
                </button>
              </div>
              <div className="editor-grid">
                <label>
                  Period
                  <input
                    value={draft.period}
                    onChange={(event) => setDraft((current) => ({ ...current, period: event.target.value }))}
                    placeholder="18th century"
                  />
                </label>
                <label>
                  Country
                  <input
                    value={draft.country}
                    onChange={(event) => setDraft((current) => ({ ...current, country: event.target.value }))}
                    placeholder="France"
                  />
                </label>
                <label>
                  Materials
                  <input
                    value={draft.materials}
                    onChange={(event) => setDraft((current) => ({ ...current, materials: event.target.value }))}
                    placeholder="Oak, gilt bronze"
                  />
                </label>
                <label>
                  Dimensions
                  <input
                    value={draft.dimensions}
                    onChange={(event) => setDraft((current) => ({ ...current, dimensions: event.target.value }))}
                    placeholder="W 56 cm x H 82 cm"
                  />
                </label>
              </div>

              <div className="media-grid">
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
                  Provenance
                  <textarea
                    rows={4}
                    value={form.provenance}
                    onChange={(event) => setForm((current) => ({ ...current, provenance: event.target.value }))}
                  />
                </label>
              </div>
              <label>
                Story notes
                <textarea
                  rows={4}
                  value={form.history}
                  onChange={(event) => setForm((current) => ({ ...current, history: event.target.value }))}
                />
              </label>
            </section>

            <section className="form-section">
              <div className="form-section-head">
                <div>
                  <p className="eyebrow">Step 4</p>
                  <h3>Pricing</h3>
                </div>
                <button
                  className="text-link"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      price: '',
                    }))
                  }
                  type="button"
                >
                  Clear section
                </button>
              </div>
              <div className="editor-grid">
                <label className={errors.price ? 'field-error' : ''}>
                  Price
                  <input
                    min={0}
                    required
                    step="0.01"
                    type="number"
                    value={form.price}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, price: event.target.value }))
                      setErrors((current) => ({ ...current, price: undefined }))
                    }}
                  />
                  {errors.price && <span className="field-note">{errors.price}</span>}
                </label>
                <label>
                  Availability
                  <select
                    value={draft.availability}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        availability: event.target.value as ListingDraftState['availability'],
                      }))
                    }
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                  </select>
                </label>
              </div>
            </section>

            <div className="editor-actions studio-actions-row">
              <button className="solid-button" disabled={status === 'loading'} type="submit">
                {status === 'loading'
                  ? 'Publishing...'
                  : editingArtifactId
                    ? 'Update listing'
                    : 'Publish listing'}
              </button>
              <button className="ghost-button" onClick={resetForm} type="button">
                Clear all
              </button>
            </div>
          </form>

          <aside className="preview-panel">
            <div className="preview-panel-head">
              <p className="eyebrow">Preview before publish</p>
              <h3>Object dossier</h3>
            </div>
            <div className="preview-hero">
              {mediaItems[0] ? (
                <MarketplaceImage alt="Primary listing preview" src={mediaItems[0].url} />
              ) : (
                <div className="media-stage-placeholder">
                  <span>Your hero image will appear here.</span>
                </div>
              )}
            </div>
            <div className="preview-meta">
              <strong>{form.title || 'Untitled listing'}</strong>
              <span>{categories?.find((category) => String(category.id) === form.category)?.name || 'Choose a category'}</span>
              <p>{form.description || 'Listing description preview'}</p>
            </div>
            <div className="preview-facts">
              <article>
                <span>Price</span>
                <strong>{form.price ? formatPrice(form.price) : '$0'}</strong>
              </article>
              <article>
                <span>Condition</span>
                <strong>{form.condition}</strong>
              </article>
              <article>
                <span>Availability</span>
                <strong>{draft.availability}</strong>
              </article>
              <article>
                <span>Media</span>
                <strong>{mediaItems.length} images</strong>
              </article>
              <article>
                <span>Period</span>
                <strong>{draft.period || 'Not set'}</strong>
              </article>
              <article>
                <span>Country</span>
                <strong>{draft.country || 'Not set'}</strong>
              </article>
            </div>
            <div className="preview-thumbs">
              {mediaItems.slice(0, 4).map((item, index) => (
                <button
                  className={index === 0 ? 'preview-thumb active' : 'preview-thumb'}
                  key={item.id}
                  onClick={() => moveMediaToFront(index)}
                  type="button"
                >
                  <MarketplaceImage alt="" src={item.url} />
                </button>
              ))}
            </div>
            <div className="preview-meta">
              <article>
                <span>Materials</span>
                <strong>{draft.materials || 'Not set'}</strong>
              </article>
              <article>
                <span>Dimensions</span>
                <strong>{draft.dimensions || 'Not set'}</strong>
              </article>
            </div>
            <div className="preview-note">
              <strong>Preview guidance</strong>
              <p>
                Keep the hero image clean, crop the object tightly, and use the detail fields to
                explain provenance, period, and condition.
              </p>
            </div>
          </aside>
        </div>

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

        <div className="table-shell">
          <table className="management-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Created date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {artifacts?.map((artifact) => (
                <tr key={artifact.id}>
                  <td>
                            <MarketplaceImage alt={artifact.title} className="table-thumb" src={resolveMarketplaceImage(artifact)} />
                  </td>
                  <td>{artifact.title}</td>
                  <td>{artifact.category_name ?? 'Uncategorized'}</td>
                  <td>{formatPrice(artifact.price)}</td>
                  <td>
                    <span className={`status-pill status-${artifact.status}`}>{artifact.status}</span>
                  </td>
                  <td>{artifact.created_at ? formatDate(artifact.created_at) : '—'}</td>
                  <td>
                    <div className="table-actions">
                      <Link className="text-link" to={`/artifacts/${artifact.id}`}>
                        Preview
                      </Link>
                      <button className="text-link" onClick={() => setEditingArtifactId(artifact.id)} type="button">
                        Edit
                      </button>
                      <button className="text-link" onClick={() => void handleDelete(artifact.id)} type="button">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
  const location = useLocation()
  const locationState = location.state as { editGalleryId?: number } | null
  const { data: galleries, loading, error, refresh } = useSellerData(getSellerGalleries)
  const [editingGalleryId, setEditingGalleryId] = useState<number | null>(
    locationState?.editGalleryId ?? null,
  )
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

  useEffect(() => {
    if (locationState?.editGalleryId && locationState.editGalleryId !== editingGalleryId) {
      setEditingGalleryId(locationState.editGalleryId)
    }
  }, [editingGalleryId, locationState])

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
              Display note
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

        <div className="table-shell">
          <table className="management-table">
            <thead>
              <tr>
                <th>Gallery</th>
                <th>Display note</th>
                <th>Visibility</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {galleries?.map((gallery) => (
                <tr key={gallery.id}>
                  <td>
                    <strong>{gallery.name}</strong>
                    <span>{gallery.description}</span>
                  </td>
                  <td>{gallery.theme || 'No note'}</td>
                  <td>{gallery.is_public ? 'Public' : 'Private'}</td>
                  <td>{gallery.created_at ? formatDate(gallery.created_at) : '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="text-link" onClick={() => setEditingGalleryId(gallery.id)} type="button">
                        Edit
                      </button>
                      <button className="text-link" onClick={() => void handleDelete(gallery.id)} type="button">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export function SellerOrdersPage() {
  return (
    <SellerGate>
      <SellerOrdersPageBody />
    </SellerGate>
  )
}

export function SellerOrderDetailPage() {
  return (
    <SellerGate>
      <SellerOrderDetailPageBody />
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
