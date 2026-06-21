import { type FormEvent, type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  addCartItem,
  checkoutCart,
  getConversation,
  getConversations,
  getCollectorDashboardSummary,
  getCart,
  getOrder,
  getOrders,
  getWishlist,
  removeCartItem,
  removeWishlistItem,
  replyConversation,
  simulateOrderPayment,
  updateCartItem,
  type CartItem,
  type OrderRecord,
  type WishlistItem,
} from './api'
import { useAuth } from './auth'
import { MarketplaceImage } from './components/MarketplaceImage'
import { resolveMarketplaceImage } from './marketplaceImages'
import { currentUserAvatarPath, currentUserDisplayName, getConversationSellerIdentity, UserAvatar } from './messageIdentity'
import { getDashboardPathForRole } from './roleRouting'
import type { CollectorDashboardSummary, ConversationDetail, ConversationSummary } from './types'

function formatPrice(value: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function formatConversationTimestamp(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatConversationListDate(value: string | null) {
  if (!value) return 'Now'
  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  })
}

function sortConversationsByRecent(conversations: ConversationSummary[]) {
  return [...conversations].sort((left, right) => {
    const leftTime = left.last_message_at ? new Date(left.last_message_at).getTime() : 0
    const rightTime = right.last_message_at ? new Date(right.last_message_at).getTime() : 0
    if (rightTime !== leftTime) {
      return rightTime - leftTime
    }
    return right.id - left.id
  })
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
    return <Navigate replace to={getDashboardPathForRole(user.role)} />
  }

  return children
}

function BuyerLayout({
  title,
  description,
  shellBodyClassName = '',
  children,
}: {
  title: string
  description: string
  shellBodyClassName?: string
  children: ReactNode
}) {
  const { user, logout } = useAuth()
  const currentUserName = currentUserDisplayName(user, 'Collector')
  const currentUserAvatar = currentUserAvatarPath(user)
  const [conversationStats, setConversationStats] = useState({
    total: 0,
    unread: 0,
  })

  useEffect(() => {
    let cancelled = false

    const loadStats = async () => {
      try {
        const conversations = await getConversations()
        if (cancelled) return
        setConversationStats({
          total: conversations.length,
          unread: conversations.reduce((total, conversation) => total + conversation.unread_count, 0),
        })
      } catch {
        if (cancelled) return
      }
    }

    void loadStats()
    const interval = window.setInterval(() => {
      void loadStats()
    }, 5000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [])

  return (
    <main className="dashboard-page dashboard-page--workspace">
      <aside className="dashboard-rail dashboard-rail--workspace">
        <div className="dashboard-user dashboard-user--workspace">
          <UserAvatar
            avatarPath={currentUserAvatar}
            className="dashboard-avatar-frame"
            initialsClassName="text-lg font-semibold uppercase tracking-[0.16em] text-white"
            label={currentUserName}
          />
          <div>
            <strong>{currentUserName}</strong>
            <span className="dashboard-role-chip">{user?.role}</span>
          </div>
          <p>{description}</p>
        </div>
        <nav className="dashboard-nav dashboard-nav--workspace" aria-label="Buyer navigation">
          <NavLink end to="/collector">
            Dashboard
          </NavLink>
          <NavLink to="/wishlist">Wishlist</NavLink>
          <NavLink to="/collector/collections">Collections</NavLink>
          <NavLink to="/cart">Cart</NavLink>
          <NavLink to="/collector/messages">
            Messages
            {conversationStats.unread > 0 ? <span className="nav-badge">{conversationStats.unread}</span> : null}
          </NavLink>
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/account">Profile</NavLink>
          <NavLink end to="/">Catalogue</NavLink>
        </nav>
        <div className="dashboard-rail-footer">
          <Link className="dashboard-cta-button" to="/collector/messages">
            Open inbox
          </Link>
        </div>
      </aside>
      <section className="dashboard-content dashboard-content--workspace">
        <div className="dashboard-header dashboard-header--workspace flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Buyer workspace</p>
            <h1>{title}</h1>
            <p className="dashboard-header-copy">Track collection activity, seller replies, saved pieces, and checkout flow from one polished collector room.</p>
          </div>
          <div className="dashboard-header-actions flex flex-wrap items-center gap-3">
            <Link className="ghost-button" to="/">
              Back to catalogue
            </Link>
            <button className="ghost-button" onClick={logout} type="button">
              Log out
            </button>
          </div>
        </div>
        <div className={`dashboard-shell-body ${shellBodyClassName}`.trim()}>{children}</div>
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
              <section className="panel-card dashboard-panel-span">
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

function CollectorMessagesPageBody() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeConversation, setActiveConversation] = useState<ConversationDetail | null>(null)
  const [threadLoading, setThreadLoading] = useState(false)
  const [threadError, setThreadError] = useState('')
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const [replyStatus, setReplyStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const messageRailRef = useRef<HTMLDivElement | null>(null)
  const messageEndRef = useRef<HTMLDivElement | null>(null)
  const lastThreadSnapshotRef = useRef<{ conversationId: number | null; messageCount: number }>({
    conversationId: null,
    messageCount: 0,
  })

  async function refreshConversations() {
    try {
      const nextConversations = await getConversations()
      setConversations(sortConversationsByRecent(nextConversations))
      setError('')
    } catch {
      setError('Unable to load your message inbox right now.')
    } finally {
      setLoading(false)
    }
  }

  async function refreshActiveConversation(conversationId: string) {
    try {
      const detail = await getConversation(conversationId)
      setActiveConversation(detail)
      setThreadError('')
    } catch {
      setThreadError('Unable to load this conversation thread.')
    } finally {
      setThreadLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    void refreshConversations()

    const interval = window.setInterval(() => {
      void refreshConversations()
    }, 5000)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (loading || id || conversations.length === 0) return
    navigate(`/collector/messages/${conversations[0].id}`, { replace: true })
  }, [conversations, id, loading, navigate])

  useEffect(() => {
    if (!id) {
      setActiveConversation(null)
      setThreadError('')
      return
    }

    setThreadLoading(true)
    void refreshActiveConversation(id)

    const interval = window.setInterval(() => {
      void refreshActiveConversation(id)
    }, 5000)

    return () => {
      window.clearInterval(interval)
    }
  }, [id])

  useLayoutEffect(() => {
    const rail = messageRailRef.current
    if (!activeConversation || !rail) {
      lastThreadSnapshotRef.current = {
        conversationId: null,
        messageCount: 0,
      }
      return
    }

    const previousSnapshot = lastThreadSnapshotRef.current
    const nextMessageCount = activeConversation.messages.length
    const isNewConversation = previousSnapshot.conversationId !== activeConversation.id
    const hasNewMessages = nextMessageCount > previousSnapshot.messageCount
    const distanceFromBottom = rail.scrollHeight - rail.scrollTop - rail.clientHeight
    const isNearBottom = distanceFromBottom < 160

    if (isNewConversation || (hasNewMessages && isNearBottom)) {
      window.requestAnimationFrame(() => {
        messageEndRef.current?.scrollIntoView({
          block: 'end',
          behavior: isNewConversation ? 'auto' : 'smooth',
        })
      })
    }

    lastThreadSnapshotRef.current = {
      conversationId: activeConversation.id,
      messageCount: nextMessageCount,
    }
  }, [activeConversation?.id, activeConversation?.messages.length])

  async function handleReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!activeConversation) return

    const cleanedDraft = draft.trim()
    if (!cleanedDraft) return

    setReplyStatus('loading')
    setThreadError('')

    try {
      const updated = await replyConversation(activeConversation.id, cleanedDraft)
      setActiveConversation(updated)
      setDraft('')
      setReplyStatus('idle')
      await refreshConversations()
    } catch {
      setReplyStatus('error')
      setThreadError('Your reply could not be sent right now.')
    }
  }

  const selectedConversationId = id ? Number(id) : null
  const activeArtifact = activeConversation?.artifact_detail
  const currentBuyerLabel = currentUserDisplayName(user, 'Collector')
  const currentBuyerAvatar = currentUserAvatarPath(user)
  const activeSellerIdentity = activeConversation ? getConversationSellerIdentity(activeConversation) : null
  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return conversations
    return conversations.filter((conversation) => {
      const sellerIdentity = getConversationSellerIdentity(conversation)
      const haystack = [
        sellerIdentity.label,
        conversation.artifact_detail.title,
        conversation.last_message_preview,
        conversation.artifact_detail.category_name ?? '',
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [conversations, search])

  return (
    <BuyerLayout
      description="Track seller replies in one collector inbox, with every conversation pinned to the exact artifact you asked about."
      shellBodyClassName="dashboard-shell-body--messages"
      title="Collector messages"
    >
      <div className="flex h-full min-h-0 flex-col rounded-[2rem] border border-[#d9e4f2] bg-[linear-gradient(180deg,#ffffff_0%,#f7faff_100%)] p-4 shadow-[0_24px_70px_rgba(15,23,42,0.05)] sm:p-5">
        <div className="mb-5 flex flex-col gap-4 rounded-[1.8rem] border border-[#e4ecf6] bg-white px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">Collector inbox</p>
            <h2 className="text-3xl font-medium tracking-tight text-[#18212f]">Live seller replies, artifact attached</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#5b6f96]">
              Watch who answered you, keep every question tied to its object, and follow the thread in real time without reopening each product page.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <article className="rounded-[1.4rem] border border-[#d9e4f2] bg-[#f8fbff] px-4 py-4">
              <span className="text-xs uppercase tracking-[0.28em] text-[#7d8faa]">Open threads</span>
              <strong className="mt-2 block text-3xl font-medium text-[#18212f]">{conversations.length}</strong>
            </article>
            <article className="rounded-[1.4rem] border border-[#d9e4f2] bg-[#1b2640] px-4 py-4 text-white">
              <span className="text-xs uppercase tracking-[0.28em] text-white/50">Unread replies</span>
              <strong className="mt-2 block text-3xl font-medium">
                {conversations.reduce((total, conversation) => total + conversation.unread_count, 0)}
              </strong>
            </article>
          </div>
        </div>

        <div className="grid flex-1 min-h-0 gap-5 xl:grid-cols-[25rem_minmax(0,1fr)]">
          <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-[1.8rem] border border-[#d9e4f2] bg-[#f9fbff] shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="border-b border-[#e7edf5] px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    avatarPath={currentBuyerAvatar}
                    className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#355bb7,#1b2640)]"
                    initialsClassName="text-sm font-semibold uppercase tracking-[0.18em] text-white"
                    label={currentBuyerLabel}
                  />
                  <div>
                    <p className="text-sm font-medium text-[#18212f]">{currentBuyerLabel}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-[#7c8aa0]">Collector inbox</p>
                  </div>
                </div>
                <button className="ghost-button" onClick={() => void refreshConversations()} type="button">
                  Refresh
                </button>
              </div>
              <label className="mt-4 block">
                <span className="sr-only">Search conversations</span>
                <input
                  className="h-12 w-full rounded-2xl border border-[#d9e4f2] bg-white px-4 text-sm text-[#18212f] outline-none transition focus:border-[#9fb2d0] focus:ring-2 focus:ring-[#355bb7]/15"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search seller, artifact, or message"
                  type="text"
                  value={search}
                />
              </label>
            </div>

            <div className="flex items-center justify-between border-b border-[#e7edf5] px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#7c8aa0]">Messages</p>
                <h3 className="mt-2 text-xl font-medium text-[#18212f]">Seller conversations</h3>
              </div>
              <span className="rounded-full border border-[#d9e4f2] bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[#6f82a5]">
                {filteredConversations.length} threads
              </span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
              {loading ? <p className="px-3 py-4 text-sm text-[#5c6c82]">Loading conversations...</p> : null}
              {error ? <p className="error-message">{error}</p> : null}
              {!loading && !error && filteredConversations.length === 0 ? (
                <div className="rounded-[1.4rem] border border-dashed border-[#d9e4f2] bg-[#f8fbff] px-4 py-8 text-center">
                  <h4 className="text-lg font-medium text-[#18212f]">
                    {conversations.length === 0 ? 'No seller replies yet' : 'No conversations match this search'}
                  </h4>
                  <p className="mt-2 text-sm leading-7 text-[#5c6c82]">
                    {conversations.length === 0
                      ? 'Start a conversation from an artifact page and it will land here automatically.'
                      : 'Try another seller name, artifact title, or message keyword.'}
                  </p>
                </div>
              ) : null}
              <div className="space-y-3">
                {filteredConversations.map((conversation) => {
                  const isActive = selectedConversationId === conversation.id
                  const sellerIdentity = getConversationSellerIdentity(conversation)
                  return (
                    <Link
                      className={`block rounded-[1.5rem] border px-4 py-4 transition ${
                        isActive
                          ? 'border-[#3b5ba9] bg-[#eef4ff] shadow-[0_14px_40px_rgba(53,91,183,0.12)]'
                          : 'border-[#e3ebf6] bg-white hover:border-[#c8d6eb] hover:bg-[#fbfdff]'
                      }`}
                      key={conversation.id}
                      to={`/collector/messages/${conversation.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <UserAvatar
                          avatarPath={sellerIdentity.avatarPath}
                          className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#e3ecff,#c9d8ff)]"
                          initialsClassName="text-sm font-semibold uppercase tracking-[0.18em] text-[#355bb7]"
                          label={sellerIdentity.label}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#18212f]">{sellerIdentity.label}</p>
                              <p className="mt-1 truncate text-xs uppercase tracking-[0.22em] text-[#7d8faa]">
                                {conversation.artifact_detail.title}
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <span className="text-[11px] uppercase tracking-[0.2em] text-[#8fa0b8]">
                                {formatConversationListDate(conversation.last_message_at)}
                              </span>
                              {conversation.unread_count > 0 ? (
                                <span className="rounded-full bg-[#1b2640] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white">
                                  {conversation.unread_count}
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-2xl border border-[#d9e4f2] bg-[#eef3f9]">
                              <MarketplaceImage alt={conversation.artifact_detail.title} src={resolveMarketplaceImage(conversation.artifact_detail)} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm leading-6 text-[#5c6c82]">
                                {conversation.last_message_preview || 'Conversation opened for this object.'}
                              </p>
                              <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#8fa0b8]">
                                Lot AE-{String(conversation.artifact_detail.id).padStart(4, '0')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col overflow-hidden rounded-[1.8rem] border border-[#d9e4f2] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            {!activeConversation && !threadLoading ? (
              <div className="flex h-full items-center justify-center px-6">
                <div className="max-w-xl rounded-[1.8rem] border border-[#d9e4f2] bg-[#f8fbff] px-6 py-8 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#7c8aa0]">Collector workspace</p>
                  <h3 className="mt-3 text-3xl font-medium tracking-tight text-[#18212f]">Open a seller conversation</h3>
                  <p className="mt-3 text-sm leading-7 text-[#5c6c82]">
                    Pick any thread from the left and you will instantly see who answered, when they answered, and which artifact the reply belongs to.
                  </p>
                </div>
              </div>
            ) : null}

            {threadLoading ? (
              <div className="flex h-full items-center justify-center px-6">
                <div className="rounded-[1.6rem] border border-[#d9e4f2] bg-[#f8fbff] px-5 py-4 text-sm text-[#5c6c82]">
                  Opening conversation...
                </div>
              </div>
            ) : null}

            {activeConversation ? (
              <>
                <header className="border-b border-[#e7edf5] bg-[linear-gradient(180deg,#ffffff_0%,#f7faff_100%)] px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <UserAvatar
                        avatarPath={activeSellerIdentity?.avatarPath}
                        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#dfe8ff,#c1d4ff)]"
                        initialsClassName="text-sm font-semibold uppercase tracking-[0.14em] text-[#355bb7]"
                        label={activeSellerIdentity?.label ?? 'Verified seller'}
                      />
                      <div className="min-w-0">
                        <h3 className="truncate text-2xl font-medium tracking-tight text-[#18212f]">
                          {activeSellerIdentity?.label ?? 'Verified seller'}
                        </h3>
                        <p className="text-xs uppercase tracking-[0.24em] text-[#7c8aa0]">Seller thread</p>
                      </div>
                    </div>
                    {activeArtifact ? (
                      <Link className="text-link shrink-0" to={`/artifacts/${activeArtifact.id}`}>
                        Open product page
                      </Link>
                    ) : null}
                  </div>
                </header>

                <div
                  className="flex-1 min-h-0 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,#fbfdff_0%,#f2f6fb_100%)] px-5 py-5"
                  ref={messageRailRef}
                >
                  {activeConversation.messages.map((message) => {
                    const isBuyerMessage = message.sender === user?.id
                    const senderLabel = isBuyerMessage
                      ? currentBuyerLabel
                      : activeSellerIdentity?.label ?? 'Verified seller'
                    const senderAvatar = isBuyerMessage
                      ? currentBuyerAvatar
                      : message.sender_avatar_path || activeSellerIdentity?.avatarPath || ''
                    return (
                      <div className={`flex items-end gap-3 ${isBuyerMessage ? 'justify-end' : 'justify-start'}`} key={message.id}>
                        {!isBuyerMessage ? (
                          <UserAvatar
                            avatarPath={senderAvatar}
                            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#dfe8ff,#c1d4ff)]"
                            initialsClassName="text-sm font-semibold uppercase tracking-[0.18em] text-[#355bb7]"
                            label={senderLabel}
                          />
                        ) : null}
                        <article
                          className={`max-w-2xl rounded-[1.5rem] px-4 py-4 text-sm leading-7 shadow-sm ${
                            isBuyerMessage
                              ? 'bg-[linear-gradient(135deg,#355bb7,#243f7f)] text-white'
                              : 'border border-[#d9e4f2] bg-white text-[#18212f]'
                          }`}
                        >
                          <p>{message.body}</p>
                          <div className="mt-2 text-[10px] uppercase tracking-[0.2em]">
                            <span className={isBuyerMessage ? 'text-white/55' : 'text-[#8fa0b8]'}>
                              {formatConversationTimestamp(message.created_at)}
                            </span>
                          </div>
                        </article>
                        {isBuyerMessage ? (
                          <UserAvatar
                            avatarPath={senderAvatar}
                            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#355bb7,#1b2640)]"
                            initialsClassName="text-sm font-semibold uppercase tracking-[0.18em] text-white"
                            label={senderLabel}
                          />
                        ) : null}
                      </div>
                    )
                  })}
                  <div aria-hidden="true" ref={messageEndRef} />
                </div>

                <form className="border-t border-[#e7edf5] bg-white px-3 py-2 sm:px-4 sm:py-3" onSubmit={handleReply}>
                  <div className="rounded-[1.2rem] border border-[#d9e4f2] bg-[#f8fbff] p-2.5">
                    <textarea
                      className="min-h-[3.5rem] w-full resize-none rounded-[0.9rem] border border-[#d9e4f2] bg-white px-3 py-2 text-sm leading-5 text-[#18212f] outline-none transition focus:border-[#9fb2d0] focus:ring-2 focus:ring-[#3857a6]/15"
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Reply here and keep the discussion moving."
                      required
                      value={draft}
                    />
                    {threadError ? (
                      <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {threadError}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                      <button
                        className="inline-flex h-9 items-center justify-center rounded-2xl bg-[#18212f] px-4 text-sm font-medium text-white transition hover:bg-[#0f1724] disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={replyStatus === 'loading'}
                        type="submit"
                      >
                        {replyStatus === 'loading' ? 'Sending...' : 'Send reply'}
                      </button>
                    </div>
                  </div>
                </form>
              </>
            ) : null}
          </section>
        </div>
      </div>
    </BuyerLayout>
  )
}

export function CollectorMessagesPage() {
  return (
    <BuyerGate>
      <CollectorMessagesPageBody />
    </BuyerGate>
  )
}
