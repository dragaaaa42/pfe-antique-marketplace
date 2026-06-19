import { type ReactNode, useEffect, useState } from 'react'
import { Link, Navigate, NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  addCartItem,
  checkoutCart,
  getCollectorDashboardSummary,
  getCart,
  getOrder,
  getOrders,
  getWishlist,
  removeCartItem,
  removeWishlistItem,
  simulateOrderPayment,
  updateCartItem,
  type CartItem,
  type OrderRecord,
  type WishlistItem,
} from './api'
import { useAuth } from './auth'
import { MarketplaceImage } from './components/MarketplaceImage'
import { resolveMarketplaceImage } from './marketplaceImages'
import type { CollectorDashboardSummary } from './types'

function formatPrice(value: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function BuyerGate({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { status, user } = useAuth()

  if (status === 'loading') {
    return (
      <main className="empty-page">
        <section className="empty-card">
          <p className="eyebrow">Collector access</p>
          <h1>Loading account...</h1>
        </section>
      </main>
    )
  }

  if (!user) {
    return <Navigate replace state={{ redirectTo: location.pathname }} to="/login" />
  }

  if (user.role !== 'buyer') {
    return (
      <main className="empty-page">
        <section className="empty-card">
          <p className="eyebrow">Access denied</p>
          <h1>This area is only for collectors.</h1>
          <p>Sellers and admins can continue browsing the public catalogue.</p>
          <Link className="solid-button" to="/">
            Return to catalogue
          </Link>
        </section>
      </main>
    )
  }

  return children
}

function BuyerLayout({
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
        <nav className="dashboard-nav" aria-label="Buyer navigation">
          <NavLink end to="/collector">
            Dashboard
          </NavLink>
          <NavLink to="/wishlist">Wishlist</NavLink>
          <NavLink to="/collector/collections">Collections</NavLink>
          <NavLink to="/cart">Cart</NavLink>
          <NavLink to="/orders">Orders</NavLink>
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
            <p className="eyebrow">Buyer workspace</p>
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

function useCollectorDashboardData() {
  const [data, setData] = useState<CollectorDashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')

    try {
      const result = await getCollectorDashboardSummary()
      setData(result)
    } catch {
      setError('Unable to load collector dashboard right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  return { data, loading, error, refresh }
}

function useBuyerCollection<T>(load: () => Promise<T>) {
  const [items, setItems] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')

    try {
      const result = await load()
      setItems(result)
    } catch {
      setError('Unable to load your account area right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  return { items, setItems, loading, error, refresh, setError }
}

export function CollectorDashboardPage() {
  return (
    <BuyerGate>
      <CollectorDashboardPageBody />
    </BuyerGate>
  )
}

function CollectorDashboardPageBody() {
  const { user } = useAuth()
  const { data, loading, error, refresh } = useCollectorDashboardData()

  return (
    <BuyerLayout
      description="Track your saved objects, orders, and profile from one collector workspace."
      title="Dashboard"
    >
      <div className="panel-card">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Collector summary</p>
            <h2>Workspace home</h2>
          </div>
          <button className="ghost-button" onClick={() => void refresh()} type="button">
            Refresh
          </button>
        </div>

        {loading && <p>Loading collector dashboard...</p>}
        {error && <p className="error-message">{error}</p>}

        {data && (
          <>
            <div className="metric-row">
              <article>
                <strong>{data.stats.wishlist_count}</strong>
                <span>Wishlist items</span>
              </article>
              <article>
                <strong>{data.stats.order_count}</strong>
                <span>Orders</span>
              </article>
              <article>
                <strong>{data.stats.paid_orders}</strong>
                <span>Paid orders</span>
              </article>
              <article>
                <strong>{data.stats.cart_count}</strong>
                <span>Cart items</span>
              </article>
            </div>

            <div className="dashboard-grid">
              <section className="panel-card">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Profile summary</p>
                    <h3>{data.profile.email}</h3>
                  </div>
                  <Link className="text-link" to="/account">
                    Edit profile
                  </Link>
                </div>
                <div className="validation-list">
                  <article className="validation-card">
                    <div>
                      <strong>
                        {data.profile.first_name || data.profile.last_name
                          ? `${data.profile.first_name} ${data.profile.last_name}`.trim()
                          : data.profile.email}
                      </strong>
                      <span>{data.profile.role}</span>
                    </div>
                    <span>{data.profile.avatar_3d_path || 'No avatar path'}</span>
                  </article>
                </div>
              </section>

              <section className="panel-card">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Recent activity</p>
                    <h3>Saved and purchased</h3>
                  </div>
                  <Link className="text-link" to="/orders">
                    View orders
                  </Link>
                </div>
                <div className="order-list">
                  {data.recent_activity.map((item, index) => (
                    <article className="order-card" key={`${item.kind}-${item.label}-${index}`}>
                      <div>
                        <strong>{item.label}</strong>
                        <p>{item.detail}</p>
                      </div>
                      <span>{item.kind}</span>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <div className="dashboard-grid">
              <section className="panel-card">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Wishlist summary</p>
                    <h3>Recent saved pieces</h3>
                  </div>
                  <Link className="text-link" to="/wishlist">
                    Open wishlist
                  </Link>
                </div>
                <div className="manage-list">
                  {data.wishlist_items.map((item) => (
                    <article className="manage-card" key={item.id}>
                      <MarketplaceImage
                        alt={item.artifact_detail.title}
                        src={resolveMarketplaceImage(item.artifact_detail)}
                      />
                      <div>
                        <strong>{item.artifact_detail.title}</strong>
                        <span>{item.artifact_detail.category_name ?? 'Uncategorized'}</span>
                        <p>{formatPrice(item.artifact_detail.price)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel-card">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Orders summary</p>
                    <h3>Recent purchases</h3>
                  </div>
                  <Link className="text-link" to="/orders">
                    Open order history
                  </Link>
                </div>
                <div className="order-list">
                  {data.recent_orders.map((order) => (
                    <article className="order-card" key={order.id}>
                      <div>
                        <strong>Order #{order.id}</strong>
                        <p>{order.status}</p>
                      </div>
                      <div>
                        <strong>{formatPrice(order.total_amount)}</strong>
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <div className="panel-card">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">Quick links</p>
                  <h3>Continue exploring</h3>
                </div>
                <span>{user?.role}</span>
              </div>
              <div className="editor-actions">
                <Link className="ghost-button" to="/wishlist">
                  Wishlist
                </Link>
                <Link className="ghost-button" to="/collector/collections">
                  Collections
                </Link>
                <Link className="ghost-button" to="/cart">
                  Cart
                </Link>
                <Link className="ghost-button" to="/orders">
                  Orders
                </Link>
                <Link className="solid-button" to="/account">
                  Profile
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </BuyerLayout>
  )
}

function WishlistCard({
  item,
  onRemove,
  onMoveToCart,
}: {
  item: WishlistItem
  onRemove: (id: number) => Promise<void>
  onMoveToCart: (item: WishlistItem) => Promise<void>
}) {
  const artifact = item.artifact_detail

  return (
    <article className="manage-card">
      <MarketplaceImage alt={artifact.title} src={resolveMarketplaceImage(artifact)} />
      <div>
        <strong>{artifact.title}</strong>
        <span>{artifact.category_name ?? 'Uncategorized'}</span>
        <p>{formatPrice(artifact.price)}</p>
      </div>
      <div className="manage-actions">
        <Link className="text-link" to={`/artifacts/${artifact.id}`}>
          View
        </Link>
        <button className="ghost-button" onClick={() => onMoveToCart(item)} type="button">
          Add to cart
        </button>
        <button className="ghost-button" onClick={() => onRemove(item.id)} type="button">
          Remove
        </button>
      </div>
    </article>
  )
}

export function WishlistPage() {
  return (
    <BuyerGate>
      <WishlistPageBody />
    </BuyerGate>
  )
}

function WishlistPageBody() {
  const { items, loading, error, refresh } = useBuyerCollection(getWishlist)

  async function handleRemove(id: number) {
    await removeWishlistItem(id)
    await refresh()
  }

  async function handleMoveSavedItemToCart(item: WishlistItem) {
    await addCartItem(item.artifact_detail.id, 1)
    await removeWishlistItem(item.id)
    await refresh()
  }

  return (
    <BuyerLayout
      description="Save rare objects, group them into collections, and move them into checkout when you are ready."
      title="Wishlist & collections"
    >
      <div className="panel-card">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Saved objects</p>
            <h2>Your saved collections</h2>
            </div>
          <button
            className="ghost-button"
            onClick={() => {
              void refresh()
            }}
            type="button"
          >
            Refresh
          </button>
        </div>
        {loading && <p>Loading wishlist...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && items && items.length === 0 && (
          <div className="empty-card">
            <h3>No saved objects yet</h3>
            <p>Use the heart on a product page to save pieces here.</p>
          </div>
        )}
        <div className="manage-list">
          {items?.map((item) => (
            <WishlistCard
              item={item}
              key={item.id}
              onMoveToCart={handleMoveSavedItemToCart}
              onRemove={handleRemove}
            />
          ))}
        </div>
      </div>
    </BuyerLayout>
  )
}

function CartItemCard({
  item,
  onDecrease,
  onIncrease,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem
  onDecrease: (item: CartItem) => Promise<void>
  onIncrease: (item: CartItem) => Promise<void>
  onRemove: (id: number) => Promise<void>
  onUpdateQuantity: (id: number, quantity: number) => Promise<void>
}) {
  const artifact = item.artifact_detail

  return (
    <article className="manage-card">
      <MarketplaceImage alt={artifact.title} src={resolveMarketplaceImage(artifact)} />
      <div>
        <strong>{artifact.title}</strong>
        <span>{artifact.category_name ?? 'Uncategorized'}</span>
        <p>
          {formatPrice(artifact.price)} each - subtotal {item.subtotal}
        </p>
      </div>
      <div className="manage-actions">
        <button className="ghost-button" onClick={() => onDecrease(item)} type="button">
          -
        </button>
        <input
          aria-label={`Quantity for ${artifact.title}`}
          min={1}
          onChange={(event) => onUpdateQuantity(item.id, Number(event.target.value))}
          type="number"
          value={item.quantity}
        />
        <button className="ghost-button" onClick={() => onIncrease(item)} type="button">
          +
        </button>
        <button className="ghost-button" onClick={() => onRemove(item.id)} type="button">
          Remove
        </button>
      </div>
    </article>
  )
}

export function CartPage() {
  return (
    <BuyerGate>
      <CartPageBody />
    </BuyerGate>
  )
}

function CartPageBody() {
  const navigate = useNavigate()
  const { items, loading, error, refresh } = useBuyerCollection(getCart)
  const [statusMessage, setStatusMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleRemove(id: number) {
    await removeCartItem(id)
    await refresh()
  }

  async function handleUpdateQuantity(id: number, quantity: number) {
    if (Number.isNaN(quantity) || quantity < 1) {
      return
    }
    await updateCartItem(id, quantity)
    await refresh()
  }

  async function handleCheckout() {
    setIsSubmitting(true)
    setStatusMessage('')

    try {
      const order = await checkoutCart()
      navigate(`/orders/${order.id}`)
    } catch {
      setStatusMessage('Checkout could not be completed right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const total = items?.reduce((sum, item) => sum + Number(item.subtotal), 0) ?? 0

  return (
    <BuyerLayout
      description="Review quantities, adjust items, and place an order when everything looks right."
      title="Cart"
    >
      <div className="panel-card">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Cart review</p>
            <h2>Your active cart</h2>
          </div>
          <button className="solid-button" disabled={isSubmitting} onClick={handleCheckout} type="button">
            {isSubmitting ? 'Placing order...' : 'Checkout'}
          </button>
        </div>
        {loading && <p>Loading cart...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && items && items.length === 0 && (
          <div className="empty-card">
            <h3>Your cart is empty</h3>
            <p>Add approved artifacts from their product pages.</p>
          </div>
        )}
        {statusMessage && <p className="error-message">{statusMessage}</p>}
        <div className="manage-list">
          {items?.map((item) => (
            <CartItemCard
              item={item}
              key={item.id}
              onDecrease={async (current) => {
                await handleUpdateQuantity(current.id, current.quantity - 1)
                if (current.quantity - 1 < 1) {
                  await handleRemove(current.id)
                }
              }}
              onIncrease={async (current) => {
                await handleUpdateQuantity(current.id, current.quantity + 1)
              }}
              onRemove={handleRemove}
              onUpdateQuantity={handleUpdateQuantity}
            />
          ))}
        </div>
        <div className="panel-card">
          <strong>Total: {formatPrice(String(total))}</strong>
        </div>
      </div>
    </BuyerLayout>
  )
}

function OrderSummaryCard({ order }: { order: OrderRecord }) {
  return (
    <article className="order-card">
      <div>
        <strong>Order #{order.id}</strong>
        <p>
          {order.items.length} item{order.items.length === 1 ? '' : 's'} - {order.status}
        </p>
      </div>
      <div>
        <strong>{formatPrice(order.total_amount)}</strong>
        <span>{new Date(order.created_at).toLocaleString()}</span>
      </div>
      <Link className="text-link" to={`/orders/${order.id}`}>
        View details
      </Link>
    </article>
  )
}

export function OrdersPage() {
  return (
    <BuyerGate>
      <OrdersPageBody />
    </BuyerGate>
  )
}

function OrdersPageBody() {
  const { items, loading, error, refresh } = useBuyerCollection(getOrders)

  return (
    <BuyerLayout
      description="Review your purchase history and open any order for payment simulation details."
      title="Orders"
    >
      <div className="panel-card">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Order history</p>
            <h2>Previous orders</h2>
          </div>
          <button className="ghost-button" onClick={() => void refresh()} type="button">
            Refresh
          </button>
        </div>
        {loading && <p>Loading orders...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && items && items.length === 0 && (
          <div className="empty-card">
            <h3>No orders yet</h3>
            <p>Checkout a cart to create your first order.</p>
          </div>
        )}
        <div className="order-list">
          {items?.map((order) => (
            <OrderSummaryCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </BuyerLayout>
  )
}

export function OrderDetailPage() {
  return (
    <BuyerGate>
      <OrderDetailPageBody />
    </BuyerGate>
  )
}

function OrderDetailPageBody() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [messageStatus, setMessageStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (!id) return

    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const result = await getOrder(id)
        if (!cancelled) {
          setOrder(result)
        }
      } catch {
        if (!cancelled) {
          setOrder(null)
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

  async function handlePayment(success: boolean) {
    if (!id) return
    try {
      const updated = await simulateOrderPayment(id, success)
      setOrder(updated)
      setMessage(success ? 'Payment marked as successful.' : 'Payment marked as failed.')
      setMessageStatus('success')
    } catch {
      setMessage('Payment simulation could not be completed.')
      setMessageStatus('error')
    }
  }

  if (loading) {
    return (
      <BuyerLayout description="Open your order and simulate payment outcomes." title="Order details">
        <div className="panel-card">
          <p>Loading order...</p>
        </div>
      </BuyerLayout>
    )
  }

  if (!order) {
    return (
      <BuyerLayout description="Open your order and simulate payment outcomes." title="Order details">
        <div className="empty-card">
          <h3>Order not found</h3>
          <button className="ghost-button" onClick={() => navigate('/orders')} type="button">
            Back to orders
          </button>
        </div>
      </BuyerLayout>
    )
  }

  return (
    <BuyerLayout description="Open your order and simulate payment outcomes." title={`Order #${order.id}`}>
      <div className="panel-card">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Order details</p>
            <h2>{order.status}</h2>
            <p>
              Created on {new Date(order.created_at).toLocaleString()} - {formatPrice(order.total_amount)}
            </p>
          </div>
          <div className="editor-actions">
            <button className="solid-button" onClick={() => void handlePayment(true)} type="button">
              Simulate success
            </button>
            <button className="ghost-button" onClick={() => void handlePayment(false)} type="button">
              Simulate failure
            </button>
          </div>
        </div>
        {message && (
          <p className={messageStatus === 'error' ? 'error-message' : 'success-message'}>
            {message}
          </p>
        )}
        <div className="order-list">
          {order.items.map((item) => (
            <article className="order-card" key={item.id}>
              <div>
                <strong>{item.artifact_title}</strong>
                <p>
                  {item.quantity} x {formatPrice(item.price)}
                </p>
              </div>
              <div>
                <strong>{item.subtotal}</strong>
                <span>{item.artifact_detail.category_name ?? 'Uncategorized'}</span>
              </div>
              <Link className="text-link" to={`/artifacts/${item.artifact_detail.id}`}>
                View object
              </Link>
            </article>
          ))}
        </div>
      </div>
    </BuyerLayout>
  )
}
