import { type FormEvent, type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  createSellerArtifact,
  createSellerGallery,
  deleteSellerArtifact,
  deleteSellerGallery,
  getConversation,
  getConversations,
  getCategories,
  getSellerArtifacts,
  getSellerDashboardSummary,
  getSellerGalleries,
  getSellerOrder,
  getSellerOrders,
  replyConversation,
  updateSellerArtifact,
  updateSellerGallery,
} from './api'
import { useAuth } from './auth'
import { MarketplaceImage } from './components/MarketplaceImage'
import { resolveMarketplaceImage } from './marketplaceImages'
import { currentUserAvatarPath, currentUserDisplayName, getConversationBuyerIdentity, UserAvatar } from './messageIdentity'
import { getDashboardPathForRole } from './roleRouting'
import type { Artifact, ConversationDetail, ConversationSummary, Gallery, SellerOrderRecord } from './types'

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

  if (user.role !== 'seller') {
    return <Navigate replace to={getDashboardPathForRole(user.role)} />
  }

  return children
}

function SellerLayout({
  title,
  description,
  shellBodyClassName = '',
  compactHeader,
  children,
}: {
  title: string
  description: string
  shellBodyClassName?: string
  compactHeader?: boolean
  children: ReactNode
}) {
  const { user, logout } = useAuth()
  const currentUserName = currentUserDisplayName(user, 'Seller')
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
        <div className="dashboard-user dashboard-user--workspace flex flex-col gap-3 p-4" style={{ padding: '1.25rem' }}>
          <div className="flex items-center gap-3">
            <UserAvatar
              avatarPath={currentUserAvatar}
              className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md"
              initialsClassName="text-base font-semibold uppercase tracking-[0.16em] text-white bg-[linear-gradient(135deg,#5b76ff,#2a376f)]"
              label={currentUserName}
            />
            <div className="flex flex-col items-start min-w-0">
              <strong className="text-white text-base truncate w-full leading-tight m-0">{currentUserName}</strong>
              <span className="info-chip mt-1 text-[0.65rem] border border-[rgba(255,255,255,0.2)] bg-[rgba(0,0,0,0.2)] text-white px-2 rounded-full font-medium tracking-wide">
                {user?.role === 'seller' ? 'SELLER' : user?.role?.toUpperCase()}
              </span>
            </div>
          </div>
          <p className="text-xs text-[rgba(255,255,255,0.6)] leading-relaxed m-0 border-t border-[rgba(255,255,255,0.1)] pt-3">
            {description}
          </p>
        </div>
        <nav className="dashboard-nav dashboard-nav--workspace" aria-label="Seller navigation">
          <NavLink end to="/seller">
            Dashboard
          </NavLink>
          <NavLink to="/seller/products">Products</NavLink>
          <NavLink to="/seller/messages">
            Messages
            {conversationStats.unread > 0 ? <span className="nav-badge">{conversationStats.unread}</span> : null}
          </NavLink>
          <NavLink to="/seller/orders">Orders received</NavLink>
          <NavLink to="/seller/profile">Profile</NavLink>
          <NavLink end to="/">Catalogue</NavLink>
        </nav>
        <div className="dashboard-rail-footer">
          <Link className="dashboard-cta-button" to="/seller/products">
            Manage products
          </Link>
        </div>
      </aside>
      <section className="dashboard-content dashboard-content--workspace">
        {compactHeader ? (
          <div className="dashboard-header dashboard-header--workspace flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 mb-4 border-b border-[var(--line)]">
            <div className="flex flex-row items-baseline gap-3">
              <h1 className="!m-0 text-xl font-medium tracking-tight text-[var(--ink)]">{title}</h1>
              <p className="text-sm text-[var(--muted)] m-0">{description}</p>
            </div>
            <div className="dashboard-header-actions flex flex-wrap items-center gap-2 ml-auto">
              <span className="info-chip text-[0.65rem] border border-[var(--line)] px-2 py-1 rounded-full bg-[rgba(255,255,255,0.6)] text-[var(--muted)] tracking-wide uppercase font-medium">Inventory Mode</span>
              <Link className="ghost-button !text-xs !py-1.5 !px-3 border border-transparent hover:border-[var(--line)] bg-[rgba(255,255,255,0.4)]" to="/">
                Back to catalogue
              </Link>
              <button className="ghost-button !text-xs !py-1.5 !px-3 border border-[rgba(255,0,0,0.1)] text-red-600 hover:bg-red-50" onClick={logout} type="button">
                Log out
              </button>
            </div>
          </div>
        ) : (
          <div className="dashboard-header dashboard-header--workspace flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow">Seller workspace</p>
              <h1>{title}</h1>
              <p className="dashboard-header-copy">Keep your listings, orders, and collector conversations inside one sharper seller command room.</p>
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
        )}
        <div className={`dashboard-shell-body ${shellBodyClassName}`.trim()}>{children}</div>
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

  const pendingCount = orders.filter(o => o.status === 'pending').length
  const completedCount = orders.filter(o => o.status === 'paid').length
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.seller_revenue), 0)

  return (
    <SellerLayout
      description="View orders that include your antiques and track what buyers have purchased."
      title="Orders received"
    >
      <div className="flex flex-col gap-6 animate-fade-in" style={{ animation: 'fadeIn 0.5s ease-out' }}>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div className="flex justify-between items-end mb-1">
          <div>
            <h2 className="text-xl font-semibold text-[var(--ink)] m-0">All orders</h2>
            <p className="text-sm text-[#5c6c82] mt-1 m-0">Review your past and current sales.</p>
          </div>
          <div className="flex gap-2">
            <button className="ghost-button" style={{ minHeight: '2rem', padding: '0 0.8rem', fontSize: '0.85rem' }} onClick={() => void refresh()} type="button">
              Refresh Data
            </button>
          </div>
        </div>

        {/* Order Summaries */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <div className="panel-card flex flex-col p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white cursor-default border border-[var(--line)]">
            <div className="flex justify-between items-center mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(95,112,255,0.1)] text-[#4658c6] text-xl">🛍️</div>
              <span className="text-2xl font-bold text-[#1a2035]">{orders.length}</span>
            </div>
            <strong className="text-[#1a2035] text-sm">Total orders</strong>
            <span className="text-xs text-[#5c6c82] mt-0.5">All time</span>
          </div>
          <div className="panel-card flex flex-col p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white cursor-default border border-[var(--line)]">
            <div className="flex justify-between items-center mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(214,133,57,0.1)] text-[#d68539] text-xl">⏳</div>
              <span className="text-2xl font-bold text-[#1a2035]">{pendingCount}</span>
            </div>
            <strong className="text-[#1a2035] text-sm">Pending</strong>
            <span className="text-xs text-[#5c6c82] mt-0.5">Awaiting fulfillment</span>
          </div>
          <div className="panel-card flex flex-col p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white cursor-default border border-[var(--line)]">
            <div className="flex justify-between items-center mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(34,197,94,0.1)] text-[#22c55e] text-xl">✅</div>
              <span className="text-2xl font-bold text-[#1a2035]">{completedCount}</span>
            </div>
            <strong className="text-[#1a2035] text-sm">Completed</strong>
            <span className="text-xs text-[#5c6c82] mt-0.5">Successfully fulfilled</span>
          </div>
          <div className="panel-card flex flex-col p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white cursor-default border border-[var(--line)]">
            <div className="flex justify-between items-center mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(95,112,255,0.1)] text-[#4658c6] text-xl">💳</div>
              <span className="text-2xl font-bold text-[#1a2035]">{formatPrice(String(totalRevenue))}</span>
            </div>
            <strong className="text-[#1a2035] text-sm">Total revenue</strong>
            <span className="text-xs text-[#5c6c82] mt-0.5">Earned from sales</span>
          </div>
        </div>

        {loading && <p className="text-sm text-[#5c6c82] mt-4">Loading received orders...</p>}
        {error && <p className="error-message mt-4">{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl border-[var(--line)] text-center bg-[var(--surface-soft)] mt-4">
            <span className="text-4xl mb-4 opacity-60">🛍️</span>
            <strong className="block text-lg text-[#1a2035] mb-2">No orders received yet</strong>
            <p className="text-sm text-[#5c6c82] m-0 mb-4 max-w-sm">When collectors purchase your artifacts, their orders will appear here for you to fulfill.</p>
            <Link className="solid-button px-4 py-2 text-sm rounded-md" to="/seller/products">Promote your products</Link>
          </div>
        )}

        {orders.length > 0 && (
          <div className="panel-card p-6 mt-2 border border-[var(--line)] shadow-sm" style={{ borderRadius: '1rem' }}>
            <h3 className="text-lg font-semibold text-[#1a2035] mb-4">Order history</h3>
            <div className="flex flex-col gap-3">
              {orders.map((order) => (
                <article className="flex flex-col md:flex-row md:items-center gap-4 p-4 border border-[var(--line)] rounded-xl hover:shadow-md transition-all hover:bg-white bg-[#f8fafc]" key={order.id}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[rgba(95,112,255,0.06)] border border-[rgba(95,112,255,0.12)] text-[#4658c6] text-xl flex-shrink-0 bg-white">
                      📦
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <strong className="text-[#1a2035] text-base">Order #{order.id}</strong>
                        <span className="info-chip" style={{ padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>{order.status}</span>
                      </div>
                      <p className="text-sm text-[#5c6c82] m-0">
                        {order.buyer_first_name || order.buyer_last_name
                          ? `${order.buyer_first_name} ${order.buyer_last_name}`.trim()
                          : order.buyer_email}
                      </p>
                      <p className="text-xs text-[#8fa0b8] mt-1">{formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex-1 text-sm text-[#5c6c82] px-4 md:border-l md:border-[var(--line)]">
                    <strong className="block text-[#1a2035] mb-1">Items</strong>
                    {order.items.map((item) => item.artifact_title).slice(0, 2).join(', ')}
                    {order.items.length > 2 && ` +${order.items.length - 2} more`}
                  </div>

                  <div className="flex items-center gap-6 justify-between md:justify-end flex-1 mt-4 md:mt-0">
                    <div className="text-right">
                      <span className="block text-xs text-[#5c6c82] mb-0.5">Your payout</span>
                      <strong className="block text-[#4658c6] text-lg leading-none">{formatPrice(order.seller_revenue)}</strong>
                    </div>
                    <Link className="ghost-button px-4 py-2 min-h-0 text-sm rounded-md border border-[var(--line)] bg-white" to={`/seller/orders/${order.id}`}>View details</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
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



  return (
    <SellerLayout
      description="Add product photos, edit listing information, delete products, and track what you sell."
      title="Seller Dashboard"
    >
      <div className="flex justify-between items-end mb-1">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ink)] m-0">Inventory overview</h2>
          <p className="text-sm text-[#5c6c82] mt-1 m-0">See your product totals here. Manage listings, conversations, and orders.</p>
        </div>
        <div className="flex gap-2">
          <Link className="solid-button" style={{ minHeight: '2rem', padding: '0 0.8rem', fontSize: '0.85rem' }} to="/seller/products">
            Add Product
          </Link>
          <button className="ghost-button" style={{ minHeight: '2rem', padding: '0 0.8rem', fontSize: '0.85rem' }} onClick={() => void refresh()} type="button">
            Refresh Data
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-[#5c6c82]">Loading seller dashboard...</p>}
      {error && <p className="error-message">{error}</p>}

      {data && (
        <div className="flex flex-col gap-6 animate-fade-in" style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Stat Cards - Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
            <div className="panel-card flex flex-col p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white cursor-default">
              <div className="flex justify-between items-center mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(95,112,255,0.1)] text-[#4658c6] text-xl">🏛️</div>
                <span className="text-2xl font-bold text-[#1a2035]">{data.stats.total_listings}</span>
              </div>
              <strong className="text-[#1a2035] text-sm">Products you have</strong>
              <span className="text-xs text-[#5c6c82] mt-0.5">Total catalogue</span>
            </div>
            <div className="panel-card flex flex-col p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white cursor-default">
              <div className="flex justify-between items-center mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(95,112,255,0.1)] text-[#4658c6] text-xl">✅</div>
                <span className="text-2xl font-bold text-[#1a2035]">{data.stats.sold_artifacts}</span>
              </div>
              <strong className="text-[#1a2035] text-sm">Products sold</strong>
              <span className="text-xs text-[#5c6c82] mt-0.5">Successfully transferred</span>
            </div>
            <div className="panel-card flex flex-col p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white cursor-default">
              <div className="flex justify-between items-center mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(95,112,255,0.1)] text-[#4658c6] text-xl">📦</div>
                <span className="text-2xl font-bold text-[#1a2035]">{data.stats.total_sales}</span>
              </div>
              <strong className="text-[#1a2035] text-sm">Total sales</strong>
              <span className="text-xs text-[#5c6c82] mt-0.5">Orders fulfilled</span>
            </div>
            <div className="panel-card flex flex-col p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white cursor-default">
              <div className="flex justify-between items-center mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(95,112,255,0.1)] text-[#4658c6] text-xl">💳</div>
                <span className="text-2xl font-bold text-[#1a2035]">{formatPrice(data.stats.revenue)}</span>
              </div>
              <strong className="text-[#1a2035] text-sm">Revenue</strong>
              <span className="text-xs text-[#5c6c82] mt-0.5">All time earnings</span>
            </div>
          </div>

          {/* Stat Cards - Row 2 (Compact) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="panel-card flex justify-between items-center p-4 bg-white hover:shadow-md transition-shadow">
              <span className="text-sm font-medium text-[#1a2035]">Published</span>
              <span className="font-bold text-[#4658c6]">{data.stats.published_listings}</span>
            </div>
            <div className="panel-card flex justify-between items-center p-4 bg-white hover:shadow-md transition-shadow">
              <span className="text-sm font-medium text-[#1a2035]">Pending approval</span>
              <span className="font-bold text-[#d68539]">{data.stats.pending_listings}</span>
            </div>
            <div className="panel-card flex justify-between items-center p-4 bg-white hover:shadow-md transition-shadow">
              <span className="text-sm font-medium text-[#1a2035]">Marked sold</span>
              <span className="font-bold text-[#1a2035]">{data.stats.sold_listings}</span>
            </div>
            <div className="panel-card flex justify-between items-center p-4 bg-white hover:shadow-md transition-shadow">
              <span className="text-sm font-medium text-[#1a2035]">Unread messages</span>
              <span className="font-bold text-[#d63939]">{data.stats.unread_conversations}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Latest Products */}
            <section className="panel-card p-6" style={{ display: 'flex', flexDirection: 'column', height: 'auto', alignSelf: 'flex-start', justifyContent: 'flex-start', gap: '0.75rem' }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="eyebrow mb-1">Product portfolio</p>
                  <h3 className="text-lg m-0">Your latest products</h3>
                </div>
                <Link className="text-link text-sm font-medium" to="/seller/products">Manage all</Link>
              </div>

              <div className="flex flex-col gap-3">
                {data.recent_artifacts.length > 0 ? (
                  data.recent_artifacts.map((artifact) => (
                    <article className="flex items-center gap-4 p-3 border border-[var(--line)] rounded-xl hover:shadow-md transition-all hover:bg-white bg-[var(--surface-soft)]" key={artifact.id}>
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-[var(--line)]">
                        <MarketplaceImage alt={artifact.title} src={resolveMarketplaceImage(artifact)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <strong className="block truncate text-[#1a2035] text-sm mb-0.5">{artifact.title}</strong>
                        <div className="flex items-center justify-between">
                          <span className="block text-xs text-[#5c6c82]">{artifact.category_name ?? 'Uncategorized'}</span>
                          <span className="info-chip" style={{ padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>{artifact.status}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm font-semibold text-[#4658c6] m-0">{formatPrice(artifact.price)}</p>
                          <div className="flex gap-2">
                            <Link className="text-link text-xs" state={{ editArtifactId: artifact.id }} to="/seller/products">Edit</Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-xl border-[var(--line)] text-center bg-[var(--surface-soft)] w-full">
                    <span className="text-2xl mb-2 opacity-60">🏛️</span>
                    <strong className="block text-sm text-[#1a2035] mb-1">No products yet</strong>
                    <p className="text-xs text-[#5c6c82] m-0 mb-3">Add your first product to the marketplace.</p>
                    <Link className="ghost-button text-xs px-3 py-1.5 min-h-0 rounded-md border border-[var(--line)]" to="/seller/products">Add product</Link>
                  </div>
                )}
              </div>
            </section>

            {/* Seller Inbox */}
            <section className="panel-card flex flex-col h-full p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="eyebrow mb-1">Seller inbox</p>
                  <h3 className="text-lg m-0">Latest messages</h3>
                </div>
                <Link className="text-link text-sm font-medium" to="/seller/messages">Open inbox</Link>
              </div>

              <div className="flex flex-col gap-3 flex-1">
                {data.recent_conversations.length > 0 ? (
                  data.recent_conversations.map((conversation) => {
                    const buyerIdentity = getConversationBuyerIdentity(conversation)
                    return (
                      <article className="flex flex-col gap-2 p-3 border border-[var(--line)] rounded-xl hover:shadow-md transition-all hover:bg-white bg-[var(--surface-soft)]" key={conversation.id}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[rgba(95,112,255,0.1)] text-[#4658c6] flex items-center justify-center text-xs font-bold uppercase">
                              {buyerIdentity.label.substring(0, 2)}
                            </div>
                            <div>
                              <strong className="block text-sm text-[#1a2035] leading-none">{buyerIdentity.label}</strong>
                              <span className="text-[10px] text-[#5c6c82] uppercase tracking-wide">{conversation.artifact_detail.title}</span>
                            </div>
                          </div>
                          {conversation.unread_count > 0 && (
                            <span className="bg-[#d63939] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{conversation.unread_count} new</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-[#5c6c82] m-0 truncate pr-4">{conversation.last_message_preview || 'Thread created'}</p>
                          <Link className="text-link text-xs shrink-0" to={`/seller/messages/${conversation.id}`}>Reply</Link>
                        </div>
                      </article>
                    )
                  })
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed rounded-xl border-[var(--line)] text-center bg-[var(--surface-soft)]">
                    <span className="text-2xl mb-2 opacity-60">💬</span>
                    <strong className="block text-sm text-[#1a2035] mb-1">No messages yet</strong>
                    <p className="text-xs text-[#5c6c82] m-0 mb-3">Buyer inquiries will appear here.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Orders Received */}
          <section className="panel-card p-6 mt-2">
            <div className="flex justify-between items-end mb-4 sticky top-0 bg-[var(--surface)] z-10 pt-6 pb-4 -mt-6 -mx-6 px-6 border-b border-[var(--line)] shadow-sm">
              <div>
                <p className="eyebrow mb-1">Orders received</p>
                <h3 className="text-lg m-0">Recent seller orders</h3>
              </div>
              <Link className="text-link text-sm font-medium" to="/seller/orders">View all orders</Link>
            </div>

            <div className="flex flex-col gap-3">
              {data.recent_orders.length > 0 ? (
                data.recent_orders.map((order) => (
                  <article className="flex justify-between items-center p-4 border border-[var(--line)] rounded-xl hover:shadow-md transition-all hover:bg-white bg-[var(--surface-soft)]" key={order.id}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(95,112,255,0.06)] border border-[rgba(95,112,255,0.12)] text-[#4658c6] text-lg flex-shrink-0">
                        📦
                      </div>
                      <div>
                        <strong className="block text-[#1a2035] text-sm mb-0.5">
                          Order #{order.id} &middot; {order.buyer_first_name || order.buyer_last_name ? `${order.buyer_first_name} ${order.buyer_last_name}`.trim() : order.buyer_email}
                        </strong>
                        <p className="text-xs text-[#5c6c82] m-0">{order.items.map((item) => item.artifact_title).slice(0, 2).join(', ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <strong className="block text-[#4658c6] text-sm mb-1">{formatPrice(order.seller_revenue)}</strong>
                        <span className="info-chip" style={{ padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>{order.status}</span>
                      </div>
                      <Link className="ghost-button" style={{ minHeight: '1.8rem', padding: '0 0.6rem', fontSize: '0.75rem', borderRadius: '0.4rem' }} to={`/seller/orders/${order.id}`}>View</Link>
                    </div>
                  </article>
                ))
              ) : (
                <div className="text-center p-8 border border-dashed rounded-xl border-[var(--line)] bg-[var(--surface-soft)]">
                  <span className="text-3xl mb-3 block opacity-60">🛍️</span>
                  <h4 className="text-base mb-1 text-[#1a2035]">No orders yet</h4>
                  <p className="text-[#5c6c82] text-sm m-0 mb-3">When collectors purchase your artifacts, they will appear here.</p>
                  <Link className="ghost-button text-xs px-3 py-1.5 min-h-0 rounded-md border border-[var(--line)]" to="/seller/products">Ensure products are listed</Link>
                </div>
              )}
            </div>
          </section>

        </div>
      )}
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
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<ArtifactFormErrors>({})
  const [dragActive, setDragActive] = useState(false)
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

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
      const primaryImage = mediaItems[0]
      if (primaryImage?.source === 'local' && primaryImage.file) {
        payload.append('image', primaryImage.file)
      }
      payload.append('category', form.category)
      payload.append('title', form.title)
      payload.append('description', form.description)
      payload.append('history', form.history)
      payload.append('provenance', form.provenance)
      payload.append('condition', form.condition)
      payload.append('price', form.price)

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
      description="Create, edit, and preview antique listings with a workspace workflow built for premium objects."
      title="Products"
      compactHeader={true}
    >
      <div className="panel-card seller-studio animate-fade-in border border-[var(--line)] shadow-sm" style={{ animation: 'fadeIn 0.5s ease-out', borderRadius: '1rem' }}>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div className="flex justify-between items-end p-6 border-b border-[var(--line)] bg-[var(--surface-soft)]">
          <div>
            <p className="eyebrow mb-1">Listing workspace</p>
            <h2 className="text-xl font-semibold text-[var(--ink)] m-0">{editingArtifactId ? 'Edit listing' : 'Create listing'}</h2>
            <p className="text-sm text-[#5c6c82] mt-1 m-0">
              Multi-image drafting, drag and drop upload, step-by-step sections, and a live preview before publish.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="solid-button" style={{ minHeight: '2rem', padding: '0 0.8rem', fontSize: '0.85rem', borderRadius: '0.5rem' }} onClick={resetForm} type="button">
              New listing
            </button>

          </div>
        </div>

        <div className="studio-grid p-6">
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
                  <h3>Product pictures</h3>
                </div>
                <button className="text-link" onClick={clearMedia} type="button">
                  Clear section
                </button>
              </div>
              <div
                className={dragActive ? 'media-dropzone active !py-6' : 'media-dropzone !py-6'}
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
                  <h4 className="text-base mt-1 mb-1 text-[#1a2035]">Drop image files or browse from your device</h4>
                  <p className="text-sm m-0 text-[#8c9bab]">Use the first image as the hero image.</p>
                </div>
                <div className="media-dropzone-actions mt-4 flex items-center justify-center gap-3">
                  <button className="solid-button text-sm px-4 py-2 min-h-0" onClick={() => imageInputRef.current?.click()} type="button">
                    Browse images
                  </button>
                  <button className="ghost-button text-sm px-4 py-2 min-h-0 text-[#d63939] hover:bg-[#fff0f0] border-[#ffcccc]" onClick={clearMedia} type="button">
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

              {mediaItems.length > 0 && (
                <div className="media-grid mt-4">
                  {mediaItems.map((item, index) => (
                    <article className="media-card" key={item.id}>
                      <MarketplaceImage alt={item.name} src={item.url} />
                      <div className="media-card-body">
                        <strong>{index === 0 ? 'Hero image' : `Gallery image ${index + 1}`}</strong>
                        <span className="truncate">{item.name}</span>
                        <div className="manage-actions mt-2">
                          {index !== 0 && (
                            <button className="ghost-button text-xs py-1" onClick={() => moveMediaToFront(index)} type="button">Set hero</button>
                          )}
                          <button
                            className="ghost-button text-xs py-1"
                            onClick={() => {
                              setReplaceIndex(index)
                              imageInputRef.current?.click()
                            }}
                            type="button"
                          >
                            Replace
                          </button>
                          <button className="ghost-button text-xs py-1 text-[#d63939]" onClick={() => removeMediaItem(index)} type="button">Remove</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
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

          <aside className="preview-panel sticky top-6 self-start bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--line)] overflow-hidden">
            <div className="p-5 border-b border-[var(--line)] bg-[#f8fafc]">
              <p className="eyebrow mb-1">Preview before publish</p>
              <h3 className="text-lg m-0 text-[#1a2035]">Object dossier</h3>
            </div>
            <div className="preview-hero">
              {mediaItems[0] ? (
                <MarketplaceImage alt="Primary listing preview" src={mediaItems[0].url} />
              ) : (
                <div className="media-stage-placeholder bg-[var(--surface-soft)] text-[#8c9bab] flex items-center justify-center p-12 text-sm text-center">
                  <span>No image available.</span>
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
            {mediaItems.length > 0 && (
              <div className="preview-thumbs flex gap-2 px-5 py-4 border-b border-[var(--line)] overflow-x-auto">
                {mediaItems.slice(0, 4).map((item, index) => (
                  <button
                    className={`preview-thumb w-12 h-12 rounded-md overflow-hidden border shrink-0 ${index === 0 ? 'border-[#4658c6]' : 'border-[var(--line)] opacity-70'}`}
                    key={item.id}
                    onClick={() => moveMediaToFront(index)}
                    type="button"
                  >
                    <MarketplaceImage alt="" src={item.url} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
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

        {loading && <p className="text-sm text-[#5c6c82] mt-6 px-6">Loading listings...</p>}
        {error && <p className="error-message mx-6 mt-6">{error}</p>}
        {!loading && !error && artifacts && artifacts.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl border-[var(--line)] text-center bg-[var(--surface-soft)] m-6 mt-0">
            <span className="text-4xl mb-4 opacity-60">🏛️</span>
            <strong className="block text-lg text-[#1a2035] mb-2">No listings yet</strong>
            <p className="text-sm text-[#5c6c82] m-0 max-w-sm">Create your first product from the form above.</p>
          </div>
        )}

        {artifacts && artifacts.length > 0 && (
          <div className="flex flex-col gap-3 m-6 mt-0 border-t border-[var(--line)] pt-6">
            <h3 className="text-lg font-semibold text-[#1a2035] mb-2">Your catalogue</h3>
            {artifacts.map((artifact) => (
              <article className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border border-[var(--line)] rounded-xl hover:shadow-md transition-all hover:bg-white bg-[#f8fafc]" key={artifact.id}>
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-[var(--line)] bg-white">
                  <MarketplaceImage
                    alt={artifact.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                    src={resolveMarketplaceImage(artifact)}
                  />
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <strong className="block truncate text-[#1a2035] text-base mb-1">{artifact.title}</strong>
                  <div className="flex flex-wrap items-center gap-4 mb-2">
                    <span className="text-sm text-[#5c6c82]">{artifact.category_name ?? 'Uncategorized'}</span>
                    <span className="text-sm font-semibold text-[#4658c6]">{formatPrice(artifact.price)}</span>
                    <span className="info-chip" style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>{artifact.status}</span>
                  </div>
                  <div className="text-xs text-[#8c9bab]">
                    Created: {artifact.created_at ? formatDate(artifact.created_at) : '—'}
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto justify-end mt-2 md:mt-0">
                  <Link className="ghost-button text-xs px-4 py-2 min-h-0 rounded-md border border-[var(--line)] bg-white" to={`/artifacts/${artifact.id}`}>
                    Preview
                  </Link>
                  <button className="solid-button text-xs px-4 py-2 min-h-0 rounded-md" onClick={() => { setEditingArtifactId(artifact.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }} type="button">
                    Edit
                  </button>
                  <button className="ghost-button text-xs px-4 py-2 min-h-0 rounded-md border border-[#ffcccc] text-[#d63939] hover:bg-[#fff0f0] bg-white" onClick={() => void handleDelete(artifact.id)} type="button">
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
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
              Gallery layout path
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

function SellerMessagesBody() {
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

  async function refreshConversations(showLoader = true) {
    if (showLoader) {
      setLoading(true)
    }
    setError('')

    try {
      const nextConversations = await getConversations()
      setConversations(sortConversationsByRecent(nextConversations))
    } catch {
      setError('Unable to load the seller inbox right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshConversations()

    const interval = window.setInterval(() => {
      void refreshConversations(false)
    }, 5000)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (loading || id || conversations.length === 0) return
    navigate(`/seller/messages/${conversations[0].id}`, { replace: true })
  }, [conversations, id, loading, navigate])

  useEffect(() => {
    if (!id) {
      setActiveConversation(null)
      setThreadError('')
      return
    }

    let cancelled = false

    const loadConversation = async () => {
      setThreadLoading(true)
      setThreadError('')

      try {
        const detail = await getConversation(id)
        if (cancelled) return
        setActiveConversation(detail)
      } catch {
        if (cancelled) return
        setThreadError('Unable to load this conversation thread.')
      } finally {
        if (!cancelled) {
          setThreadLoading(false)
        }
      }
    }

    void loadConversation()

    const interval = window.setInterval(() => {
      void loadConversation()
    }, 5000)

    return () => {
      cancelled = true
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
      const nextConversations = await getConversations()
      setConversations(sortConversationsByRecent(nextConversations))
    } catch {
      setReplyStatus('error')
      setThreadError('Reply failed. Please try again in a moment.')
    }
  }

  const activeArtifact = activeConversation?.artifact_detail
  const selectedConversationId = id ? Number(id) : null
  const currentSellerLabel = currentUserDisplayName(user, 'Seller')
  const currentSellerAvatar = currentUserAvatarPath(user)
  const activeBuyerIdentity = activeConversation ? getConversationBuyerIdentity(activeConversation) : null
  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return conversations
    return conversations.filter((conversation) => {
      const buyerIdentity = getConversationBuyerIdentity(conversation)
      const haystack = [
        buyerIdentity.label,
        conversation.artifact_detail.title,
        conversation.last_message_preview,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [conversations, search])

  return (
    <SellerLayout
      description="Reply to collector questions with the artifact context pinned directly beside the thread."
      shellBodyClassName="dashboard-shell-body--messages"
      title="Seller messages"
    >
      <div className="flex h-full min-h-0 flex-col rounded-[2rem] border border-[#d9e4f2] bg-[linear-gradient(180deg,#ffffff_0%,#f7faff_100%)] p-4 shadow-[0_24px_70px_rgba(15,23,42,0.05)] sm:p-5">
        <div className="mb-5 flex flex-col gap-4 rounded-[1.8rem] border border-[#e4ecf6] bg-white px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">Inbox overview</p>
            <h2 className="text-3xl font-medium tracking-tight text-[#18212f]">Buyer conversations, artifact-first</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#5b6f96]">
              Every thread opens with the object attached, so you can answer with provenance, shipping, and condition context without leaving the seller workspace.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <article className="rounded-[1.4rem] border border-[#d9e4f2] bg-[#f8fbff] px-4 py-4">
              <span className="text-xs uppercase tracking-[0.28em] text-[#7d8faa]">Open threads</span>
              <strong className="mt-2 block text-3xl font-medium text-[#18212f]">{conversations.length}</strong>
            </article>
            <article className="rounded-[1.4rem] border border-[#d9e4f2] bg-[#1b2640] px-4 py-4 text-white">
              <span className="text-xs uppercase tracking-[0.28em] text-white/50">Unread notes</span>
              <strong className="mt-2 block text-3xl font-medium">
                {conversations.reduce((total, conversation) => total + conversation.unread_count, 0)}
              </strong>
            </article>
          </div>
        </div>

        <div className="grid flex-1 min-h-0 gap-5 xl:grid-cols-[25rem_minmax(0,1fr)]">
          <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-[1.8rem] border border-[#d9e4f2] bg-[#f9fbff] shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    avatarPath={currentSellerAvatar}
                    className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#355bb7,#1b2640)]"
                    initialsClassName="text-sm font-semibold uppercase tracking-[0.18em] text-white"
                    label={currentSellerLabel}
                  />
                  <div>
                    <p className="text-sm font-medium text-[#18212f]">{currentSellerLabel}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-[#7c8aa0]">Seller inbox</p>
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
                  placeholder="Search buyer, artifact, or message"
                  type="text"
                  value={search}
                />
              </label>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
              {loading ? <p className="px-3 py-4 text-sm text-[#5c6c82]">Loading inbox...</p> : null}
              {error ? <p className="error-message">{error}</p> : null}
              {!loading && !error && filteredConversations.length === 0 ? (
                <div className="rounded-[1.4rem] border border-dashed border-[#d9e4f2] bg-[#f8fbff] px-4 py-8 text-center">
                  <h4 className="text-lg font-medium text-[#18212f]">
                    {conversations.length === 0 ? 'No messages yet' : 'No conversations match this search'}
                  </h4>
                  <p className="mt-2 text-sm leading-7 text-[#5c6c82]">
                    {conversations.length === 0
                      ? 'Threads will land here automatically when collectors ask about your objects.'
                      : 'Try another buyer name, artifact title, or message keyword.'}
                  </p>
                </div>
              ) : null}

              <div className="space-y-3">
                {filteredConversations.map((conversation) => {
                  const isActive = selectedConversationId === conversation.id
                  const buyerIdentity = getConversationBuyerIdentity(conversation)
                  return (
                    <Link
                      className={`block rounded-[1.5rem] border px-4 py-4 transition ${isActive
                          ? 'border-[#3b5ba9] bg-[#eef4ff] shadow-[0_14px_40px_rgba(53,91,183,0.12)]'
                          : 'border-[#e3ebf6] bg-white hover:border-[#c8d6eb] hover:bg-[#fbfdff]'
                        }`}
                      key={conversation.id}
                      to={`/seller/messages/${conversation.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <UserAvatar
                          avatarPath={buyerIdentity.avatarPath}
                          className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#e3ecff,#c9d8ff)]"
                          initialsClassName="text-sm font-semibold uppercase tracking-[0.18em] text-[#355bb7]"
                          label={buyerIdentity.label}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#18212f]">{buyerIdentity.label}</p>
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
                  <p className="text-xs uppercase tracking-[0.3em] text-[#7c8aa0]">Seller workspace</p>
                  <h3 className="mt-3 text-3xl font-medium tracking-tight text-[#18212f]">Pick a thread to chat</h3>
                </div>
              </div>
            ) : null}

            {threadLoading ? (
              <div className="flex h-full items-center justify-center px-6">
                <div className="rounded-[1.6rem] border border-[#d9e4f2] bg-[#f8fbff] px-5 py-4 text-sm text-[#5c6c82]">
                  Loading chat...
                </div>
              </div>
            ) : null}

            {activeConversation ? (
              <>
                <header className="border-b border-[#e7edf5] bg-[linear-gradient(180deg,#ffffff_0%,#f7faff_100%)] px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar
                        avatarPath={activeBuyerIdentity?.avatarPath}
                        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#dfe8ff,#c1d4ff)]"
                        initialsClassName="text-sm font-semibold uppercase tracking-[0.14em] text-[#355bb7]"
                        label={activeBuyerIdentity?.label ?? 'Collector'}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-lg font-medium tracking-tight text-[#18212f]">
                            {activeBuyerIdentity?.label ?? 'Collector'}
                          </h3>
                        </div>
                        <p className="mt-1 text-xs text-[#6f7f9b]">
                          {activeConversation?.last_message_at &&
                            Date.now() - new Date(activeConversation.last_message_at).getTime() < 2 * 60 * 1000
                            ? 'Online'
                            : activeConversation?.last_message_at
                              ? `Last seen ${formatConversationTimestamp(activeConversation.last_message_at)}`
                              : 'Offline'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {activeArtifact ? (
                        <Link className="text-link hidden md:inline-block" to={`/artifacts/${activeArtifact.id}`}>
                          View product
                        </Link>
                      ) : null}
                    </div>
                  </div>

                  {activeArtifact ? (
                    <div className="mt-3 flex items-center gap-3 border-t border-[#f0f4fb] pt-3">
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-[#e6eef9] bg-[#fbfdff]">
                        <MarketplaceImage alt={activeArtifact.title} src={resolveMarketplaceImage(activeArtifact)} />
                      </div>
                      <div className="min-w-0">
                        <Link to={`/artifacts/${activeArtifact.id}`} className="text-sm font-medium text-[#18212f] truncate">
                          {activeArtifact.title}
                        </Link>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="text-sm text-[#5c6c82]">{activeArtifact.category_name ?? 'Uncategorized'}</span>
                          <strong className="text-sm text-[#18212f]">{formatPrice(activeArtifact.price)}</strong>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </header>

                <div
                  className="flex-1 min-h-0 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,#fbfdff_0%,#f2f6fb_100%)] px-5 py-5"
                  ref={messageRailRef}
                >
                  {activeConversation.messages.map((message) => {
                    const isSellerMessage = message.sender_role === 'seller'
                    const senderLabel = isSellerMessage
                      ? currentSellerLabel
                      : activeBuyerIdentity?.label ?? 'Collector'
                    const senderAvatar = isSellerMessage
                      ? currentSellerAvatar
                      : message.sender_avatar_path || activeBuyerIdentity?.avatarPath || ''
                    return (
                      <div className={`flex items-end gap-3 ${isSellerMessage ? 'justify-end' : 'justify-start'}`} key={message.id}>
                        {!isSellerMessage ? (
                          <UserAvatar
                            avatarPath={senderAvatar}
                            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#dfe8ff,#c1d4ff)]"
                            initialsClassName="text-sm font-semibold uppercase tracking-[0.18em] text-[#355bb7]"
                            label={senderLabel}
                          />
                        ) : null}
                        <article
                          className={`message-bubble ${isSellerMessage ? 'message-bubble--me' : 'message-bubble--them'}`}
                        >
                          <div className="message-body text-sm">{message.body}</div>
                          <div className="message-meta">
                            <time className="message-time">{formatConversationTimestamp(message.created_at)}</time>
                            {isSellerMessage ? (
                              <span className="message-status" aria-hidden>
                                {message.read_at ? '✓✓' : '✓'}
                              </span>
                            ) : null}
                          </div>
                        </article>
                        {isSellerMessage ? (
                          <UserAvatar
                            avatarPath={senderAvatar}
                            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#355bb7,#1b2640)]"
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
                  <div className="chat-input-shell">
                    <button
                      type="button"
                      className="chat-attachment-button"
                      title="Attach a file"
                      onClick={() => alert('Attachment picker not implemented')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6f7f9b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05L12.37 20.12a5 5 0 0 1-7.07 0 5 5 0 0 1 0-7.07L11.3 7.15a3 3 0 0 1 4.24 4.24L11.3 15.63" /></svg>
                    </button>
                    <input
                      aria-label="Type a message"
                      className="chat-input"
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Type a message..."
                      value={draft}
                    />
                    <button
                      className="chat-send-button"
                      aria-label="Send message"
                      type="submit"
                      disabled={replyStatus === 'loading' || draft.trim() === ''}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                  </div>
                  {threadError ? (
                    <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {threadError}
                    </p>
                  ) : null}
                </form>
              </>
            ) : null}
          </section>
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

export function SellerMessagesPage() {
  return (
    <SellerGate>
      <SellerMessagesBody />
    </SellerGate>
  )
}
export function SellerProfilePage() {
  const { user } = useAuth()
  const currentUserName = currentUserDisplayName(user, 'Seller')
  const currentUserAvatar = currentUserAvatarPath(user)

  return (
    <SellerLayout
      description="View your public seller profile as it appears to collectors."
      title="Seller Profile"
    >
      <div className="flex flex-col md:flex-row gap-6 max-w-5xl">
        <div className="panel-card flex-1 flex flex-col gap-6 animate-fade-in shadow-sm border border-[var(--line)] p-8" style={{ borderRadius: '1.25rem' }}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <UserAvatar
              avatarPath={currentUserAvatar}
              className="w-24 h-24 rounded-full border border-[var(--line)] shadow-sm shrink-0"
              initialsClassName="bg-[rgba(95,112,255,0.08)] text-[#4658c6]"
              label={currentUserName}
            />
            <div className="flex flex-col gap-2 items-center sm:items-start text-center sm:text-left mt-2">
              <h2 className="text-[1.65rem] font-medium text-[var(--ink)] m-0">{currentUserName}</h2>
              <span className="info-chip bg-[rgba(95,112,255,0.08)] text-[#4658c6] border border-[#d2dff6] px-3 py-1 rounded-full text-[0.7rem] font-medium uppercase tracking-widest inline-block mt-1">
                Verified Seller
              </span>
              <p className="text-[var(--muted)] text-sm m-0 mt-1">{user?.email}</p>
            </div>
          </div>

          <div className="border-t border-[var(--line)] pt-6 mt-2">
            <h3 className="text-[1.1rem] font-medium mb-3 text-[var(--ink)]">About the Seller</h3>
            <p className="text-[#5c6c82] leading-7 text-[0.95rem]">
              This seller hasn't added a biography yet. They specialize in curated antique acquisitions. Contact them directly for more provenance information on any of their active listings.
            </p>
          </div>

          <div className="border-t border-[var(--line)] pt-6 mt-2 flex flex-col sm:flex-row gap-8">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.15em] text-[#8c9bab] mb-1.5 font-medium">Member Since</p>
              <p className="font-medium text-[var(--ink)] text-[0.95rem]">
                2024
              </p>
            </div>
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.15em] text-[#8c9bab] mb-1.5 font-medium">Marketplace Status</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span>
                <p className="font-medium text-[var(--ink)] text-[0.95rem]">Active & Listing</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="panel-card shadow-sm border border-[var(--line)] p-6 bg-[var(--surface-soft)]" style={{ borderRadius: '1.25rem' }}>
            <h3 className="text-[1.05rem] font-medium mb-2 text-[var(--ink)]">Account Settings</h3>
            <p className="text-sm text-[#5c6c82] mb-6 leading-relaxed">
              Need to update your password, email, or profile picture?
            </p>
            <Link to="/account" className="solid-button w-full justify-center !py-2.5 shadow-sm text-sm" style={{ borderRadius: '0.85rem' }}>
              Edit Account Settings
            </Link>
          </div>
        </div>
      </div>
    </SellerLayout>
  )
}
