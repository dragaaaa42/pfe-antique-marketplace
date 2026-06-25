import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useState, useRef } from 'react'
import { Link, Navigate, NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  approveAdminArtifact,
  deleteAdminGallery,
  getAdminArtifacts,
  getAdminAuditTrail,
  getAdminDashboardSummary,
  getAdminGalleries,
  getAdminUser,
  getAdminUsers,
  rejectAdminArtifact,
  updateAdminUser,
  deleteAdminUser,
  getArtifact,
  updateAdminArtifact,
  getCategories,
} from './api'
import { useAuth } from './auth'
import { MarketplaceImage } from './components/MarketplaceImage'
import { resolveMarketplaceImage } from './marketplaceImages'
import { currentUserAvatarPath, currentUserDisplayName, UserAvatar } from './messageIdentity'
import { getDashboardPathForRole } from './roleRouting'
import type {
  AdminUser,
  Artifact,
  Gallery,
  ModerationAction,
  Category,
} from './types'

function formatPrice(value: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}

function AdminGate({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { status, user } = useAuth()

  if (status === 'loading') {
    return (
      <main className="empty-page">
        <section className="empty-card">
          <p className="eyebrow">Admin access</p>
          <h1>Loading administration workspace...</h1>
        </section>
      </main>
    )
  }

  if (!user) {
    return <Navigate replace state={{ redirectTo: location.pathname }} to="/login" />
  }

  if (user.role !== 'admin') {
    return <Navigate replace to={getDashboardPathForRole(user.role)} />
  }

  return children
}

function AdminLayout({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  const { user, logout } = useAuth()
  const currentUserName = currentUserDisplayName(user, 'Admin')
  const currentUserAvatar = currentUserAvatarPath(user)

  return (
    <main className="dashboard-page dashboard-page--workspace admin-dashboard">
      <aside className="dashboard-rail dashboard-rail--workspace">
        <div className="dashboard-user dashboard-user--workspace flex flex-col gap-3 p-4" style={{ padding: '1.25rem' }}>
          <Link to="/account" className="flex items-center gap-3 hover:opacity-85 transition-opacity group">
            <UserAvatar
              avatarPath={currentUserAvatar}
              className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md group-hover:ring-2 group-hover:ring-[var(--primary)] transition-all"
              initialsClassName="text-base font-semibold uppercase tracking-[0.16em] text-white bg-[linear-gradient(135deg,#5b76ff,#2a376f)]"
              label={currentUserName}
            />
            <div className="flex flex-col items-start min-w-0">
              <strong className="text-white text-base truncate w-full leading-tight m-0 group-hover:text-[rgba(255,255,255,0.9)] transition-colors">{currentUserName}</strong>
              <span className="info-chip mt-1 text-[0.65rem] border border-[rgba(255,255,255,0.2)] bg-[rgba(0,0,0,0.2)] text-white px-2 rounded-full font-medium tracking-wide">
                ADMIN
              </span>
            </div>
          </Link>
          <p className="text-xs text-[rgba(255,255,255,0.6)] leading-relaxed m-0 border-t border-[rgba(255,255,255,0.1)] pt-3">
            {description}
          </p>
        </div>
        <nav className="dashboard-nav dashboard-nav--workspace" aria-label="Admin navigation">
          <NavLink end to="/admin">
            Dashboard
          </NavLink>
          <NavLink to="/admin/users">Users</NavLink>
          <NavLink to="/admin/artifacts">Artifacts</NavLink>
          <NavLink to="/admin/audit">Audit trail</NavLink>
          <NavLink to="/account">Profile Settings</NavLink>
          <NavLink end to="/">Back to catalogue</NavLink>
        </nav>
        <div className="dashboard-rail-footer">
          <Link className="dashboard-cta-button" to="/admin">
            Open workspace
          </Link>
        </div>
      </aside>
      <section className="dashboard-content dashboard-content--workspace">
        <div className="dashboard-header dashboard-header--workspace flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 mb-6 border-b border-[var(--line)]">
          <div>
            <p className="eyebrow">Administration workspace</p>
            <h1 className="!m-0 text-2xl font-semibold tracking-tight text-[var(--ink)]">{title}</h1>
            <p className="text-sm text-[var(--muted)] m-0 mt-1">{description}</p>
          </div>
          <div className="dashboard-header-actions flex flex-wrap items-center gap-2">
            <Link className="ghost-button !text-xs !py-1.5 !px-3 border border-transparent hover:border-[var(--line)] bg-[rgba(255,255,255,0.4)]" to="/">
              Back to catalogue
            </Link>
            <button className="ghost-button !text-xs !py-1.5 !px-3 border border-[rgba(255,0,0,0.1)] text-red-600 hover:bg-red-50" onClick={logout} type="button">
              Log out
            </button>
          </div>
        </div>
        <div className="dashboard-shell-body">{children}</div>
      </section>
    </main>
  )
}

function useAdminLoader<T>(loader: () => Promise<T>) {
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
      setError('Unable to load the admin workspace right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  return { data, setData, loading, error, refresh, setError }
}

function AdminDashboardBody() {
  const { data, loading, error, refresh } = useAdminLoader(getAdminDashboardSummary)

  return (
    <AdminLayout
      description="Moderate listings, manage users, and keep the marketplace healthy."
      title="Dashboard"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ink)] m-0">Platform Overview</h2>
          <p className="text-sm text-[#5c6c82] mt-1 m-0">Review system activity, moderation queue, and recent logs.</p>
        </div>
        <button
          className="ghost-button !text-xs !py-1.5 !px-3 border border-[var(--line)] bg-white hover:bg-slate-50 shadow-sm"
          onClick={() => void refresh()}
          type="button"
        >
          Refresh Data
        </button>
      </div>

      {loading && <p className="text-sm text-[#5c6c82]">Loading admin dashboard...</p>}
      {error && <p className="error-message">{error}</p>}

      {data && (
        <div className="flex flex-col gap-6 animate-fade-in" style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              {
                label: 'Total users',
                value: data.stats.total_users,
                sublabel: 'Registered accounts',
                icon: '👥',
                colors: 'bg-blue-50 text-blue-600 border border-blue-100',
              },
              {
                label: 'Total sellers',
                value: data.stats.total_sellers,
                sublabel: 'Active merchants',
                icon: '💼',
                colors: 'bg-purple-50 text-purple-600 border border-purple-100',
              },
              {
                label: 'Total artifacts',
                value: data.stats.total_artifacts,
                sublabel: 'Catalogued pieces',
                icon: '🏛️',
                colors: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
              },
              {
                label: 'Total orders',
                value: data.stats.total_orders,
                sublabel: 'Fulfilled sales',
                icon: '📦',
                colors: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
              },
              {
                label: 'Pending review',
                value: data.stats.pending_artifacts,
                sublabel: 'Awaiting approval',
                icon: '⏳',
                colors: 'bg-amber-50 text-amber-600 border border-amber-100',
              },
              {
                label: 'Published',
                value: data.stats.published_artifacts,
                sublabel: 'Live listings',
                icon: '✅',
                colors: 'bg-teal-50 text-teal-600 border border-teal-100',
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="panel-card flex items-center gap-3 p-4 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 bg-white border border-[var(--line)] shadow-sm"
                style={{ borderRadius: '12px' }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${stat.colors}`}>
                  {stat.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] text-[#5c6c82] font-semibold uppercase tracking-wider leading-none">{stat.label}</span>
                  <strong className="block text-xl font-bold text-[#1a2035] leading-none mt-1">{stat.value}</strong>
                  <span className="block text-[9px] text-[#8fa0b8] mt-0.5 truncate">{stat.sublabel}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 3-Column Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            
            {/* Left and Middle Columns (2/3 width) - Moderation Queue & Recent Accounts */}
            <div className="lg:col-span-2 flex flex-col gap-5 w-full">
              
              {/* Moderation Queue */}
              <section
                className="panel-card flex flex-col p-5 border border-[var(--line)] shadow-sm bg-white h-[380px] min-h-[380px]"
                style={{ borderRadius: '1rem' }}
              >
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-[var(--line)]">
                  <div>
                    <p className="eyebrow mb-0">Moderation queue</p>
                    <h3 className="text-base font-semibold m-0 text-[var(--ink)]">Pending artifacts</h3>
                  </div>
                  <Link className="text-[#4658c6] text-xs font-semibold hover:underline" to="/admin/artifacts">Open moderation →</Link>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
                  {data.pending_artifacts.length > 0 ? (
                    data.pending_artifacts.map((artifact) => (
                      <article
                        className="flex items-center gap-3 p-2 px-3 border border-[var(--line)] border-l-4 border-l-amber-500 rounded-xl hover:shadow-md transition-all hover:bg-white bg-[var(--surface-soft)]"
                        key={artifact.id}
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-[var(--line)] bg-white">
                          <MarketplaceImage alt={artifact.title} className="w-full h-full object-cover" src={resolveMarketplaceImage(artifact)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <strong className="block truncate text-[#1a2035] text-xs font-semibold">{artifact.title}</strong>
                            <span className="info-chip bg-amber-50 text-amber-700 border border-amber-200 text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Awaiting review</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="block text-[10px] text-[#5c6c82] truncate max-w-[150px]">{artifact.seller_email || 'Unknown seller'}</span>
                            <span className="info-chip bg-slate-100 text-slate-700 border border-slate-200 text-[9px] px-1.5 py-0.5 rounded-full font-medium">{artifact.status}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1 pt-1 border-t border-[rgba(0,0,0,0.03)]">
                            <p className="text-xs font-bold text-[#4658c6] m-0">{formatPrice(artifact.price)}</p>
                            <div className="flex gap-1.5">
                              <Link className="ghost-button !text-[9px] !py-0.5 !px-2 hover:bg-slate-100" to={`/artifacts/${artifact.id}`}>Review</Link>
                              <Link className="ghost-button !text-[9px] !py-0.5 !px-2 hover:bg-slate-100" to={`/admin/artifacts/${artifact.id}/edit`}>Edit</Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 border border-dashed rounded-xl border-[var(--line)] text-center bg-[var(--surface-soft)]">
                      <span className="text-xl mb-1 opacity-60">🏛️</span>
                      <strong className="block text-xs text-[#1a2035] mb-0.5">Queue is clear</strong>
                      <p className="text-[11px] text-[#5c6c82] m-0">No artifacts are currently awaiting moderation.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Recent Accounts */}
              <section
                className="panel-card flex flex-col p-5 border border-[var(--line)] shadow-sm bg-white h-[380px] min-h-[380px]"
                style={{ borderRadius: '1rem' }}
              >
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-[var(--line)]">
                  <div>
                    <p className="eyebrow mb-0">Users</p>
                    <h3 className="text-base font-semibold m-0 text-[var(--ink)]">Recent accounts</h3>
                  </div>
                  <Link className="text-[#4658c6] text-xs font-semibold hover:underline" to="/admin/users">Manage users →</Link>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
                  {data.recent_users.length > 0 ? (
                    data.recent_users.map((adminUser) => {
                      let roleColor = 'bg-blue-50 text-blue-700 border-blue-200'
                      if (adminUser.role === 'seller') {
                        roleColor = 'bg-purple-50 text-purple-700 border-purple-200'
                      } else if (adminUser.role === 'admin') {
                        roleColor = 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }

                      return (
                        <article
                          className="flex items-center justify-between p-2 px-3 border border-[var(--line)] rounded-xl hover:shadow-md transition-all hover:bg-white bg-[var(--surface-soft)]"
                          key={adminUser.id}
                        >
                          <div className="min-w-0 mr-3">
                            <strong className="block text-xs text-[#1a2035] font-semibold truncate mb-0.5">
                              {adminUser.first_name || adminUser.last_name
                                ? `${adminUser.first_name} ${adminUser.last_name}`.trim()
                                : adminUser.email}
                            </strong>
                            <span className="block text-[10px] text-[#5c6c82] truncate">{adminUser.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`info-chip text-[9px] px-2 py-0.5 rounded-full font-semibold border ${roleColor}`}>{adminUser.role}</span>
                            <span className={`info-chip text-[9px] px-2 py-0.5 rounded-full font-semibold border ${adminUser.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                              {adminUser.is_active ? 'Active' : 'Disabled'}
                            </span>
                            <Link className="ghost-button !text-[9px] !py-0.5 !px-2 hover:bg-slate-100 shrink-0 ml-1" to={`/admin/users/${adminUser.id}`}>
                              Details
                            </Link>
                          </div>
                        </article>
                      )
                    })
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 border border-dashed rounded-xl border-[var(--line)] text-center bg-[var(--surface-soft)]">
                      <span className="text-xl mb-1 opacity-60">👥</span>
                      <strong className="block text-xs text-[#1a2035] mb-0.5">No users</strong>
                      <p className="text-[11px] text-[#5c6c82] m-0">Registered user accounts will show here.</p>
                    </div>
                  )}
                </div>
              </section>

            </div>

            {/* Right Column (1/3 width) - Admin Action Center & Marketplace Health Insights */}
            <div className="flex flex-col gap-5 w-full">
              
              {/* Admin Action Center */}
              <section
                className="panel-card flex flex-col p-5 border border-[var(--line)] shadow-sm bg-white"
                style={{ borderRadius: '1rem' }}
              >
                <div className="mb-3 pb-2 border-b border-[var(--line)]">
                  <p className="eyebrow mb-0">Utilities</p>
                  <h3 className="text-base font-semibold m-0 text-[var(--ink)]">Admin Action Center</h3>
                </div>
                
                <div className="flex flex-col gap-2">
                  {[
                    {
                      label: 'Review Pending Artifacts',
                      desc: 'Approve or reject pending listings.',
                      to: '/admin/artifacts',
                      icon: '🏛️',
                      badge: data.stats.pending_artifacts > 0 ? `${data.stats.pending_artifacts} pending` : null,
                      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
                    },
                    {
                      label: 'Manage Users',
                      desc: 'Control accounts and permissions.',
                      to: '/admin/users',
                      icon: '👥',
                      badge: null,
                    },
                    {
                      label: 'Open Audit Trail',
                      desc: 'Inspect moderation logs history.',
                      to: '/admin/audit',
                      icon: '📋',
                      badge: null,
                    },
                    {
                      label: 'View Marketplace Catalogue',
                      desc: 'Open the public catalog room.',
                      to: '/',
                      icon: '👁️',
                      badge: 'Public',
                      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
                    },
                  ].map((act, i) => (
                    <Link
                      key={i}
                      className="group flex items-center justify-between p-2 py-1.5 px-3 border border-[var(--line)] rounded-xl hover:border-[#4658c6] hover:bg-slate-50 transition-all text-left"
                      to={act.to}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg bg-[var(--surface-soft)] w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-[var(--line)] group-hover:bg-white group-hover:scale-105 transition-all">
                          {act.icon}
                        </span>
                        <div className="min-w-0">
                          <strong className="block text-xs font-semibold text-[#1a2035] group-hover:text-[#4658c6] transition-colors">{act.label}</strong>
                          <span className="block text-[9px] text-[#5c6c82] mt-0.5 truncate max-w-[190px]">{act.desc}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        {act.badge && (
                          <span className={`info-chip text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${act.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                            {act.badge}
                          </span>
                        )}
                        <span className="text-slate-400 group-hover:translate-x-1 transition-transform text-xs">&rarr;</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Marketplace Health / Moderation Insights */}
              <section
                className="panel-card flex flex-col p-5 border border-[var(--line)] shadow-sm bg-white"
                style={{ borderRadius: '1rem' }}
              >
                <div className="mb-3 pb-2 border-b border-[var(--line)]">
                  <p className="eyebrow mb-0">Monitoring</p>
                  <h3 className="text-base font-semibold m-0 text-[var(--ink)]">Moderation Insights</h3>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Status Indicator */}
                  <div className="flex items-center justify-between p-2 px-3 bg-[var(--surface-soft)] rounded-xl border border-[var(--line)]">
                    <span className="text-[11px] font-semibold text-[#5c6c82]">System Status:</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${data.stats.pending_artifacts > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <strong className={`text-[11px] font-bold ${data.stats.pending_artifacts > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {data.stats.pending_artifacts > 0 ? 'Action Required' : 'All Listings Clear'}
                      </strong>
                    </div>
                  </div>

                  {/* Insight Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        label: 'Moderation Load',
                        val: data.stats.pending_artifacts > 5 ? 'High' : data.stats.pending_artifacts > 0 ? 'Medium' : 'Low',
                        color: data.stats.pending_artifacts > 5 ? 'text-rose-600 bg-rose-50 border-rose-100' : data.stats.pending_artifacts > 0 ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100',
                      },
                      {
                        label: 'Active Sellers',
                        val: `${Math.round((data.stats.total_sellers / Math.max(1, data.stats.total_users)) * 100)}%`,
                        color: 'text-purple-600 bg-purple-50 border-purple-100',
                      },
                      {
                        label: 'Audit Log Count',
                        val: `${data.recent_actions.length} items`,
                        color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
                      },
                      {
                        label: 'Review Queue',
                        val: `${data.stats.pending_artifacts} pending`,
                        color: 'text-blue-600 bg-blue-50 border-blue-100',
                      },
                    ].map((ins, i) => (
                      <div key={i} className="p-2 py-2 px-2.5 border border-[var(--line)] rounded-xl bg-white flex flex-col justify-between">
                        <span className="text-[9px] text-[#8fa0b8] font-bold uppercase tracking-wider">{ins.label}</span>
                        <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border text-center ${ins.color}`}>
                          {ins.val}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Visual Progress Bar (Published Ratio) */}
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-[#5c6c82] font-medium">Listing Approval Rate</span>
                      <strong className="text-[#1a2035]">{Math.round((data.stats.published_artifacts / Math.max(1, data.stats.total_artifacts)) * 100)}%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-[var(--line)]">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.round((data.stats.published_artifacts / Math.max(1, data.stats.total_artifacts)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[8px] text-[#8fa0b8]">{data.stats.published_artifacts} published / {data.stats.total_artifacts} total</span>
                  </div>

                </div>
              </section>

            </div>

          </div>

          {/* Audit Log Preview (Timeline Activity Feed) */}
          <div className="w-full">
            <section
              className="panel-card flex flex-col p-5 border border-[var(--line)] shadow-sm bg-white h-[380px] min-h-[380px]"
              style={{ borderRadius: '1rem' }}
            >
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-[var(--line)]">
                <div>
                  <p className="eyebrow mb-0">System Activity</p>
                  <h3 className="text-base font-semibold m-0 text-[var(--ink)]">Recent actions timeline</h3>
                </div>
                <Link className="text-[#4658c6] text-xs font-semibold hover:underline" to="/admin/audit">Open full log →</Link>
              </div>

              {/* Timeline Scrollable Area */}
              <div className="flex-1 overflow-y-auto pr-1">
                {/* Timeline Container */}
                <div className="relative pl-6 border-l-2 border-slate-100 flex flex-col gap-2.5 py-1">
                  {data.recent_actions.length > 0 ? (
                    data.recent_actions.map((entry) => {
                      let badgeColor = 'bg-gray-100 text-gray-700 border-gray-200'
                      let nodeColor = 'bg-slate-400 border-slate-300'
                      if (entry.action_type.includes('approve')) {
                        badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        nodeColor = 'bg-emerald-500 border-emerald-200'
                      } else if (entry.action_type.includes('reject') || entry.action_type.includes('delete') || entry.action_type.includes('disable')) {
                        badgeColor = 'bg-rose-50 text-rose-700 border-rose-200'
                        nodeColor = 'bg-rose-500 border-rose-200'
                      } else if (entry.action_type.includes('enable')) {
                        badgeColor = 'bg-blue-50 text-blue-700 border-blue-200'
                        nodeColor = 'bg-blue-500 border-blue-200'
                      }

                      return (
                        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-2.5 p-2 py-2 px-3 border border-[var(--line)] rounded-xl hover:shadow-md transition-all hover:bg-white bg-[var(--surface-soft)]" key={entry.id}>
                          {/* Timeline Node Dot */}
                          <span className={`absolute -left-[31px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm shrink-0 ${nodeColor}`} />
                          
                          <div className="flex flex-col md:flex-row md:items-center gap-3 flex-1 min-w-0">
                            {/* Action Badge */}
                            <span className={`info-chip text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border shrink-0 w-fit ${badgeColor}`}>
                              {entry.action_type.replace('_', ' ')}
                            </span>

                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-[#1a2035]">
                                {entry.target_model} <span className="font-bold text-[#4658c6]">#{entry.target_id}</span>
                              </span>
                              <span className="block md:inline md:ml-2.5 text-[10px] text-[#5c6c82] font-medium">by Admin: <span className="font-semibold">{entry.admin_email}</span></span>
                            </div>

                            {entry.notes && (
                              <p className="text-[10px] text-[#8fa0b8] italic m-0 border-t md:border-t-0 md:border-l border-slate-200 pt-0.5 md:pt-0 md:pl-2.5 truncate max-w-xs" title={entry.notes}>
                                "{entry.notes}"
                              </p>
                            )}
                          </div>

                          <div className="text-[9px] text-[#8fa0b8] font-bold uppercase tracking-wider shrink-0 text-right">
                            {formatDate(entry.created_at)}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-xl border-[var(--line)] text-center bg-[var(--surface-soft)]">
                      <span className="text-xl mb-1 opacity-60">📋</span>
                      <strong className="block text-xs text-[#1a2035] mb-0.5">No actions logged</strong>
                      <p className="text-[11px] text-[#5c6c82] m-0">Recent admin operations will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function AdminUsersBody() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<'' | AdminUser['role']>('')
  const [active, setActive] = useState<'' | 'true' | 'false'>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void | Promise<void>
  } | null>(null)

  async function refresh() {
    setLoading(true)
    setError('')

    try {
      const result = await getAdminUsers({
        search,
        role,
        is_active: active === '' ? '' : active === 'true',
      })
      setUsers(result)
    } catch {
      setError('Unable to load users right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [search, role, active])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  async function toggleActive(user: AdminUser) {
    try {
      const updated = await updateAdminUser(user.id, { is_active: !user.is_active })
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      setToast({
        type: 'success',
        text: `Account for ${updated.email} is now ${updated.is_active ? 'enabled' : 'disabled'}.`
      })
    } catch {
      setToast({ type: 'error', text: 'Could not update active status.' })
    }
  }

  async function toggleSuspend(user: AdminUser) {
    const nextSuspended = !user.is_suspended
    const perform = async () => {
      try {
        const updated = await updateAdminUser(user.id, { is_suspended: nextSuspended })
        setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)))
        setToast({
          type: 'success',
          text: `Account for ${updated.email} has been ${nextSuspended ? 'suspended' : 'unsuspended'}.`
        })
      } catch {
        setToast({ type: 'error', text: 'Could not update suspension status.' })
      }
      setConfirmModal(null)
    }

    if (nextSuspended) {
      setConfirmModal({
        isOpen: true,
        title: 'Confirm Suspension',
        message: `Are you sure you want to suspend user ${user.email}? Suspended users will not be able to log in or access dashboards.`,
        onConfirm: perform
      })
    } else {
      void perform()
    }
  }

  async function handleDelete(user: AdminUser) {
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Account Deactivation & Delete',
      message: `Are you sure you want to delete ${user.email}? This will soft-delete and permanently deactivate the user account. They will be removed from all active listings.`,
      onConfirm: async () => {
        try {
          await deleteAdminUser(user.id)
          setUsers((current) => current.filter((item) => item.id !== user.id))
          setToast({ type: 'success', text: `User ${user.email} has been soft-deleted and deactivated.` })
        } catch {
          setToast({ type: 'error', text: 'Could not soft-delete this user account.' })
        }
        setConfirmModal(null)
      }
    })
  }

  async function toggleVerify(user: AdminUser) {
    try {
      const updated = await updateAdminUser(user.id, { is_verified: !user.is_verified })
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      setToast({
        type: 'success',
        text: `Seller ${updated.email} verification set to ${updated.is_verified ? 'Verified' : 'Unverified'}.`
      })
    } catch {
      setToast({ type: 'error', text: 'Could not update seller verification status.' })
    }
  }

  return (
    <AdminLayout description="Search, review, and control marketplace accounts." title="Users">
      <div className="panel-card p-6 border border-[var(--line)] shadow-sm bg-white" style={{ borderRadius: '1rem' }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[var(--ink)] m-0">All accounts</h2>
            <p className="text-xs text-[#5c6c82] mt-1 m-0">Filter and moderate registered user accounts.</p>
          </div>
          <button
            className="ghost-button !text-xs !py-1.5 !px-3 border border-[var(--line)] bg-white hover:bg-slate-50 shadow-sm"
            onClick={() => void refresh()}
            type="button"
          >
            Refresh Users
          </button>
        </div>

        <form className="bg-[var(--surface-soft)] p-4 rounded-2xl border border-[var(--line)] mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in" onSubmit={(event: FormEvent<HTMLFormElement>) => event.preventDefault()}>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[var(--ink)]">Search</span>
            <input
              className="text-sm px-3 py-2 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6]"
              placeholder="Email or name"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[var(--ink)]">Role</span>
            <select
              className="text-sm px-3 py-2 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6]"
              value={role}
              onChange={(event) => setRole(event.target.value as '' | AdminUser['role'])}
            >
              <option value="">All roles</option>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[var(--ink)]">Account status</span>
            <select
              className="text-sm px-3 py-2 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6]"
              value={active}
              onChange={(event) => setActive(event.target.value as '' | 'true' | 'false')}
            >
              <option value="">All accounts</option>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>
        </form>

        {loading && <p className="text-xs text-[#5c6c82] my-4">Loading users...</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="table-shell border border-[var(--line)] rounded-xl overflow-hidden shadow-sm bg-white">
          <table className="management-table w-full border-collapse">
            <thead className="sticky top-0 bg-[#f8fafc] z-10">
              <tr className="border-b border-[var(--line)]">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">User</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">Email</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">Role</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                let roleColor = 'bg-blue-50 text-blue-700 border-blue-200'
                if (user.role === 'seller') {
                  roleColor = 'bg-purple-50 text-purple-700 border-purple-200'
                } else if (user.role === 'admin') {
                  roleColor = 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }

                return (
                  <tr className="border-b border-[var(--line)] hover:bg-[#f8faff] transition-colors" key={user.id}>
                    <td className="px-6 py-4 text-sm font-semibold text-[var(--ink)]">
                      {user.first_name || user.last_name
                        ? `${user.first_name} ${user.last_name}`.trim()
                        : (user.email || user.username || `User #${user.id}`)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5c6c82] font-medium">{user.email || '—'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`info-chip ${roleColor} text-[10px] px-2.5 py-0.5 rounded-full font-semibold border`} style={{ padding: '0.15rem 0.5rem' }}>{user.role}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col gap-1 items-start">
                        {user.is_suspended ? (
                          <span className="info-chip bg-amber-50 text-amber-700 border-amber-200 text-[10px] px-2.5 py-0.5 rounded-full font-semibold border">Suspended</span>
                        ) : user.is_active ? (
                          <span className="info-chip bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-2.5 py-0.5 rounded-full font-semibold border">Active</span>
                        ) : (
                          <span className="info-chip bg-rose-50 text-rose-700 border-rose-200 text-[10px] px-2.5 py-0.5 rounded-full font-semibold border">Disabled</span>
                        )}
                        {user.role === 'seller' && (
                          <span className={`info-chip text-[9px] px-2 py-0.5 rounded-full font-semibold border ${user.is_verified ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                            {user.is_verified ? 'Verified' : 'Unverified'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5c6c82] font-medium">{formatDate(user.date_joined)}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex justify-end items-center gap-1.5 flex-wrap max-w-[280px] ml-auto">
                        <Link className="action-btn action-btn--details" to={`/admin/users/${user.id}`}>
                          Details
                        </Link>
                        <button
                          className={`action-btn ${user.is_active ? 'action-btn--danger' : 'action-btn--success'}`}
                          onClick={() => toggleActive(user)}
                          type="button"
                        >
                          {user.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          className={`action-btn ${user.is_suspended ? 'action-btn--success' : 'action-btn--warning'}`}
                          onClick={() => toggleSuspend(user)}
                          type="button"
                        >
                          {user.is_suspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                        {user.role === 'seller' && (
                          <button
                            className={`action-btn ${user.is_verified ? 'action-btn--warning' : 'action-btn--success'}`}
                            onClick={() => toggleVerify(user)}
                            type="button"
                          >
                            {user.is_verified ? 'Unverify' : 'Verify'}
                          </button>
                        )}
                        <button
                          className="action-btn action-btn--danger"
                          onClick={() => handleDelete(user)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[var(--line)] rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl text-left">
            <h3 className="text-lg font-bold text-[var(--ink)] mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-[var(--muted)] mb-6">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <button
                className="ghost-button !py-2 !px-4 border border-[var(--line)] hover:bg-slate-50 text-sm font-semibold"
                style={{ borderRadius: '0.5rem' }}
                onClick={() => setConfirmModal(null)}
              >
                Cancel
              </button>
              <button
                className="solid-button !py-2 !px-4 bg-red-650 hover:bg-red-700 text-white text-sm font-semibold border-none"
                style={{ borderRadius: '0.5rem' }}
                onClick={() => {
                  void confirmModal.onConfirm()
                }}
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className={`p-4 rounded-xl border shadow-lg flex items-center gap-2 ${
            toast.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <span className="text-lg">{toast.type === 'success' ? '✅' : '❌'}</span>
            <span className="text-sm font-semibold">{toast.text}</span>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function AdminUserDetailBody() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const result = await getAdminUser(id)
        if (!cancelled) {
          setUser(result)
        }
      } catch {
        if (!cancelled) {
          setUser(null)
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

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    setSaving(true)

    try {
      const updated = await updateAdminUser(user.id, {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: user.is_active,
        is_suspended: user.is_suspended,
        is_verified: user.is_verified,
      })
      setUser(updated)
      setToast({ type: 'success', text: 'User profile updated successfully.' })
    } catch {
      setToast({ type: 'error', text: 'Unable to update this user right now.' })
    } finally {
      setSaving(false)
    }
  }

  function handleDeleteClick() {
    if (!user) return
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Account Deactivation & Delete',
      message: `Are you sure you want to delete ${user.email}? This will soft-delete and permanently deactivate the user account. They will be logged out and cannot log back in.`,
      onConfirm: async () => {
        try {
          await deleteAdminUser(user.id)
          setToast({ type: 'success', text: `User ${user.email} has been deactivated and soft-deleted.` })
          setTimeout(() => navigate('/admin/users'), 1500)
        } catch {
          setToast({ type: 'error', text: 'Could not delete this account right now.' })
        }
        setConfirmModal(null)
      }
    })
  }

  if (loading) {
    return (
      <AdminLayout description="Inspect account details and permissions." title="User details">
        <div className="panel-card p-6 border border-[var(--line)] shadow-sm bg-white" style={{ borderRadius: '1rem' }}>
          <p className="text-sm text-[var(--muted)]">Loading user...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!user) {
    return (
      <AdminLayout description="Inspect account details and permissions." title="User details">
        <div className="empty-card p-8 text-center border border-[var(--line)] bg-white rounded-2xl shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--ink)]">User not found</h3>
          <button className="ghost-button mt-4" onClick={() => navigate('/admin/users')} type="button">
            Back to users
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout description="Inspect account details and permissions." title={`User #${user.id}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 panel-card p-6 border border-[var(--line)] shadow-sm bg-white" style={{ borderRadius: '1rem' }}>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--line)]">
            <div>
              <p className="eyebrow mb-1">Edit Account Profile</p>
              <h2 className="text-xl font-semibold text-[var(--ink)] m-0">User settings</h2>
            </div>
            <Link className="ghost-button !text-xs !py-1.5 !px-3 hover:bg-slate-50 border border-[var(--line)]" to="/admin/users">
              Back to users
            </Link>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--ink)]">First name</label>
                <input
                  className="text-sm px-3 py-2.5 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] transition-all"
                  value={user.first_name}
                  onChange={(event) => setUser((current) => (current ? { ...current, first_name: event.target.value } : current))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--ink)]">Last name</label>
                <input
                  className="text-sm px-3 py-2.5 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] transition-all"
                  value={user.last_name}
                  onChange={(event) => setUser((current) => (current ? { ...current, last_name: event.target.value } : current))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--ink)]">Email Address</label>
                <input
                  className="text-sm px-3 py-2.5 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] transition-all"
                  type="email"
                  value={user.email}
                  onChange={(event) => setUser((current) => (current ? { ...current, email: event.target.value } : current))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--ink)]">Role</label>
                <select
                  className="text-sm px-3 py-2.5 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] transition-all"
                  value={user.role}
                  onChange={(event) => setUser((current) => (current ? { ...current, role: event.target.value as AdminUser['role'] } : current))}
                >
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--ink)]">Account status</label>
                <select
                  className="text-sm px-3 py-2.5 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] transition-all"
                  value={String(user.is_active)}
                  onChange={(event) =>
                    setUser((current) => (current ? { ...current, is_active: event.target.value === 'true' } : current))
                  }
                >
                  <option value="true">Enabled / Active</option>
                  <option value="false">Disabled / Inactive</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--ink)]">Suspension status</label>
                <select
                  className="text-sm px-3 py-2.5 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] transition-all"
                  value={String(user.is_suspended ?? false)}
                  onChange={(event) =>
                    setUser((current) => (current ? { ...current, is_suspended: event.target.value === 'true' } : current))
                  }
                >
                  <option value="false">Active / Unsuspended</option>
                  <option value="true">Suspended</option>
                </select>
              </div>
              {user.role === 'seller' && (
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-[var(--ink)]">Seller Verification</label>
                  <select
                    className="text-sm px-3 py-2.5 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] transition-all"
                    value={String(user.is_verified ?? false)}
                    onChange={(event) =>
                      setUser((current) => (current ? { ...current, is_verified: event.target.value === 'true' } : current))
                    }
                  >
                    <option value="false">Unverified Seller</option>
                    <option value="true">Verified Seller</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-2 pt-4 border-t border-[var(--line)]">
              <button
                className="ghost-button !py-2.5 !px-5 text-red-600 border-red-200 hover:bg-red-50 font-bold"
                style={{ borderRadius: '0.75rem' }}
                onClick={handleDeleteClick}
                type="button"
              >
                Delete Account
              </button>

              <div className="flex gap-3">
                <Link className="ghost-button !py-2.5 !px-5 shadow-sm text-sm border border-[var(--line)] hover:bg-slate-50" style={{ borderRadius: '0.75rem' }} to="/admin/users">
                  Cancel
                </Link>
                <button className="solid-button !py-2.5 !px-5 shadow-sm text-sm" style={{ borderRadius: '0.75rem' }} disabled={saving} type="submit">
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: User summary */}
        <div className="panel-card p-6 border border-[var(--line)] shadow-sm bg-white flex flex-col items-center text-center" style={{ borderRadius: '1rem' }}>
          <div className="w-20 h-20 rounded-full bg-[linear-gradient(135deg,#5b76ff,#2a376f)] flex items-center justify-center text-white text-2xl font-bold uppercase tracking-wider shadow-md mb-4">
            {user.first_name && user.last_name
              ? `${user.first_name[0]}${user.last_name[0]}`
              : user.email[0]}
          </div>
          <h3 className="text-lg font-bold text-[#1a2035] leading-none mb-1">
            {user.first_name || user.last_name
              ? `${user.first_name} ${user.last_name}`.trim()
              : 'Unnamed User'}
          </h3>
          <span className="text-xs text-[#5c6c82] break-all">{user.email}</span>

          <div className="w-full mt-6 pt-6 border-t border-[var(--line)] flex flex-col gap-4 text-left">
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-[#8fa0b8] font-semibold uppercase tracking-wider">Role</span>
              <span className={`info-chip text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : user.role === 'seller' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                {user.role}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-[#8fa0b8] font-semibold uppercase tracking-wider">Status</span>
              <div className="flex gap-1">
                {user.is_suspended && (
                  <span className="info-chip text-[10px] px-2.5 py-0.5 rounded-full font-semibold border bg-amber-50 text-amber-700 border-amber-200">
                    Suspended
                  </span>
                )}
                <span className={`info-chip text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${user.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                  {user.is_active ? 'Active' : 'Disabled'}
                </span>
                {user.role === 'seller' && (
                  <span className={`info-chip text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${user.is_verified ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                    {user.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-[#8fa0b8] font-semibold uppercase tracking-wider">Member Since</span>
              <span className="text-xs text-[#5c6c82] font-semibold">{formatDate(user.date_joined)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[var(--line)] rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl text-left">
            <h3 className="text-lg font-bold text-[var(--ink)] mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-[var(--muted)] mb-6">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <button
                className="ghost-button !py-2 !px-4 border border-[var(--line)] hover:bg-slate-50 text-sm font-semibold"
                style={{ borderRadius: '0.5rem' }}
                onClick={() => setConfirmModal(null)}
              >
                Cancel
              </button>
              <button
                className="solid-button !py-2 !px-4 bg-red-650 hover:bg-red-700 text-white text-sm font-semibold border-none"
                style={{ borderRadius: '0.5rem' }}
                onClick={() => {
                  void confirmModal.onConfirm()
                }}
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className={`p-4 rounded-xl border shadow-lg flex items-center gap-2 ${
            toast.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <span className="text-lg">{toast.type === 'success' ? '✅' : '❌'}</span>
            <span className="text-sm font-semibold">{toast.text}</span>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function AdminArtifactsBody() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')

    try {
      const result = await getAdminArtifacts({
        status: statusFilter,
        search,
      })
      setArtifacts(result)
    } catch {
      setError('Unable to load artifacts right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [statusFilter, search])

  async function handleApprove(artifact: Artifact) {
    const updated = await approveAdminArtifact(artifact.id)
    setArtifacts((current) => current.map((item) => (item.id === updated.id ? updated : item)))
  }

  async function handleReject(artifact: Artifact) {
    const updated = await rejectAdminArtifact(artifact.id, 'Rejected from admin dashboard.')
    setArtifacts((current) => current.map((item) => (item.id === updated.id ? updated : item)))
  }

  return (
    <AdminLayout description="Review and moderate pending product submissions." title="Artifacts">
      <div className="panel-card p-6 border border-[var(--line)] shadow-sm bg-white" style={{ borderRadius: '1rem' }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[var(--ink)] m-0">Artifact moderation</h2>
            <p className="text-xs text-[#5c6c82] mt-1 m-0">Review pending artifacts, approve, reject, or edit details.</p>
          </div>
          <button
            className="ghost-button !text-xs !py-1.5 !px-3 border border-[var(--line)] bg-white hover:bg-slate-50 shadow-sm"
            onClick={() => void refresh()}
            type="button"
          >
            Refresh List
          </button>
        </div>

        <form className="bg-[var(--surface-soft)] p-4 rounded-2xl border border-[var(--line)] mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in" onSubmit={(event: FormEvent<HTMLFormElement>) => event.preventDefault()}>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[var(--ink)]">Search</span>
            <input
              className="text-sm px-3 py-2 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] transition-all"
              placeholder="Title, seller, or category"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[var(--ink)]">Status</span>
            <select
              className="text-sm px-3 py-2 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] transition-all"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Draft</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </form>

        {loading && <p className="text-xs text-[#5c6c82] my-4">Loading artifacts...</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="table-shell border border-[var(--line)] rounded-xl overflow-hidden shadow-sm bg-white">
          <table className="management-table w-full border-collapse">
            <thead className="sticky top-0 bg-[#f8fafc] z-10">
              <tr className="border-b border-[var(--line)]">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[var(--ink)] uppercase tracking-wider w-[80px]">Image</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">Artifact</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">Seller</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">Category</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">Price</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {artifacts.map((artifact) => {
                let statusColor = 'bg-amber-50 text-amber-700 border-amber-200'
                if (artifact.status === 'approved') {
                  statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200'
                } else if (artifact.status === 'rejected') {
                  statusColor = 'bg-rose-50 text-rose-700 border-rose-200'
                } else if (artifact.status === 'sold') {
                  statusColor = 'bg-blue-50 text-blue-700 border-blue-200'
                }

                return (
                  <tr className="border-b border-[var(--line)] hover:bg-[#f8faff] transition-colors duration-200" key={artifact.id}>
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-[var(--line)] bg-[var(--surface-soft)] shrink-0 shadow-sm">
                        <MarketplaceImage
                          alt={artifact.title}
                          className="w-full h-full object-cover"
                          loading="eager"
                          src={resolveMarketplaceImage(artifact)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[var(--ink)]">{artifact.title}</td>
                    <td className="px-6 py-4 text-sm text-[#5c6c82] font-medium">{artifact.seller_email || 'Unknown seller'}</td>
                    <td className="px-6 py-4 text-sm text-[#5c6c82]">{artifact.category_name ?? 'Uncategorized'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#4658c6]">{formatPrice(artifact.price)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`info-chip ${statusColor} text-[10px] px-2.5 py-0.5 rounded-full font-semibold border`} style={{ padding: '0.15rem 0.5rem' }}>{artifact.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Link className="ghost-button !text-[11px] !py-1 !px-2.5 font-semibold hover:bg-slate-100" to={`/artifacts/${artifact.id}`}>
                          Review
                        </Link>
                        <Link className="ghost-button !text-[11px] !py-1 !px-2.5 font-semibold hover:bg-slate-100" to={`/admin/artifacts/${artifact.id}/edit`}>
                          Edit
                        </Link>
                        {artifact.status !== 'approved' && (
                          <button className="ghost-button !text-[11px] !py-1 !px-2.5 font-semibold text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => void handleApprove(artifact)} type="button">
                            Approve
                          </button>
                        )}
                        {artifact.status !== 'rejected' && (
                          <button className="ghost-button !text-[11px] !py-1 !px-2.5 font-semibold text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => void handleReject(artifact)} type="button">
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

function AdminGalleriesBody() {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')

    try {
      const result = await getAdminGalleries({ search })
      setGalleries(result)
    } catch {
      setError('Unable to load galleries right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [search])

  async function handleDelete(gallery: Gallery) {
    await deleteAdminGallery(gallery.id)
    setGalleries((current) => current.filter((item) => item.id !== gallery.id))
  }

  return (
    <AdminLayout description="Review gallery spaces and remove inappropriate content." title="Galleries">
      <div className="panel-card p-6 border border-[var(--line)] shadow-sm bg-white" style={{ borderRadius: '1rem' }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[var(--ink)] m-0">All galleries</h2>
            <p className="text-xs text-[#5c6c82] mt-1 m-0">Manage custom virtual galleries created by members.</p>
          </div>
          <button
            className="ghost-button !text-xs !py-1.5 !px-3 border border-[var(--line)] bg-white hover:bg-slate-50 shadow-sm"
            onClick={() => void refresh()}
            type="button"
          >
            Refresh List
          </button>
        </div>

        <form className="bg-[var(--surface-soft)] p-4 rounded-2xl border border-[var(--line)] mb-6 flex flex-col gap-1.5 animate-fade-in" onSubmit={(event: FormEvent<HTMLFormElement>) => event.preventDefault()}>
          <span className="text-xs font-semibold text-[var(--ink)]">Search</span>
          <input
            className="text-sm px-3 py-2 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] w-full transition-all"
            placeholder="Name, theme, owner"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </form>

        {loading && <p className="text-xs text-[#5c6c82] my-4">Loading galleries...</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="table-shell border border-[var(--line)] rounded-xl overflow-hidden shadow-sm bg-white">
          <table className="management-table w-full border-collapse">
            <thead className="sticky top-0 bg-[#f8fafc] z-10">
              <tr className="border-b border-[var(--line)]">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">Gallery</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">Theme</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">Visibility</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {galleries.map((gallery) => (
                <tr className="border-b border-[var(--line)] hover:bg-[#f8faff] transition-colors duration-200" key={gallery.id}>
                  <td className="px-6 py-4 text-sm font-semibold text-[var(--ink)]">{gallery.name}</td>
                  <td className="px-6 py-4 text-sm text-[#5c6c82] font-medium">{gallery.owner_email || 'Unknown owner'}</td>
                  <td className="px-6 py-4 text-sm text-[#5c6c82]">{gallery.theme || 'No theme'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`info-chip ${gallery.is_public ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-700 border-slate-200'} text-[10px] px-2.5 py-0.5 rounded-full font-semibold border`} style={{ padding: '0.15rem 0.5rem' }}>
                      {gallery.is_public ? 'Public' : 'Private'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button
                      className="ghost-button !text-[11px] !py-1 !px-2.5 font-semibold text-rose-600 border-rose-200 hover:bg-rose-50"
                      onClick={() => void handleDelete(gallery)}
                      type="button"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

function AdminAuditBody() {
  const [entries, setEntries] = useState<ModerationAction[]>([])
  const [actionType, setActionType] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')

    try {
      const result = await getAdminAuditTrail({
        action_type: actionType as ModerationAction['action_type'] | '',
        search,
      })
      setEntries(result)
    } catch {
      setError('Unable to load the audit trail right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [actionType, search])

  return (
    <AdminLayout description="Review the moderation record and actions taken by admins." title="Audit trail">
      <div className="panel-card p-6 border border-[var(--line)] shadow-sm bg-white" style={{ borderRadius: '1rem' }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[var(--ink)] m-0">Audit log</h2>
            <p className="text-xs text-[#5c6c82] mt-1 m-0">Review the moderation record and actions taken by admins.</p>
          </div>
          <button
            className="ghost-button !text-xs !py-1.5 !px-3 border border-[var(--line)] bg-white hover:bg-slate-50 shadow-sm"
            onClick={() => void refresh()}
            type="button"
          >
            Refresh List
          </button>
        </div>

        <form className="bg-[var(--surface-soft)] p-4 rounded-2xl border border-[var(--line)] mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in" onSubmit={(event: FormEvent<HTMLFormElement>) => event.preventDefault()}>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[var(--ink)]">Search</span>
            <input
              className="text-sm px-3 py-2 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] transition-all"
              placeholder="Target, admin, or comment"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[var(--ink)]">Action type</span>
            <select
              className="text-sm px-3 py-2 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] transition-all"
              value={actionType}
              onChange={(event) => setActionType(event.target.value)}
            >
              <option value="">All action types</option>
              <option value="artifact_approved">Artifact approved</option>
              <option value="artifact_rejected">Artifact rejected</option>
              <option value="artifact_deleted">Artifact deleted</option>
              <option value="gallery_deleted">Gallery deleted</option>
              <option value="user_role_changed">User role changed</option>
              <option value="user_disabled">User disabled</option>
              <option value="user_enabled">User enabled</option>
            </select>
          </div>
        </form>

        {loading && <p className="text-xs text-[#5c6c82] my-4">Loading audit trail...</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="table-shell border border-[var(--line)] rounded-xl overflow-hidden shadow-sm bg-white">
          <table className="management-table w-full border-collapse">
            <thead className="sticky top-0 bg-[#f8fafc] z-10">
              <tr className="border-b border-[var(--line)]">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[var(--ink)] uppercase tracking-wider w-[180px]">Action</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">Target</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">Admin</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">Notes / Comments</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                let badgeColor = 'bg-gray-100 text-gray-700 border-gray-200'
                if (entry.action_type.includes('approve')) {
                  badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200'
                } else if (entry.action_type.includes('reject') || entry.action_type.includes('delete') || entry.action_type.includes('disable')) {
                  badgeColor = 'bg-rose-50 text-rose-700 border-rose-200'
                } else if (entry.action_type.includes('enable')) {
                  badgeColor = 'bg-blue-50 text-blue-700 border-blue-200'
                }

                return (
                  <tr className="border-b border-[var(--line)] hover:bg-[#f8faff] transition-colors duration-200" key={entry.id}>
                    <td className="px-6 py-4 text-sm">
                      <span className={`info-chip ${badgeColor} text-[10px] px-2.5 py-0.5 rounded-full font-semibold border`} style={{ padding: '0.15rem 0.5rem' }}>
                        {entry.action_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[var(--ink)]">
                      <div className="flex flex-col">
                        <span>{entry.target_model}</span>
                        <span className="text-[10px] text-[#8fa0b8] font-medium mt-0.5">ID: #{entry.target_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5c6c82] font-semibold">{entry.admin_email}</td>
                    <td className="px-6 py-4 text-sm text-[#5c6c82] italic font-medium">
                      {entry.notes ? `"${entry.notes}"` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5c6c82] text-right font-medium">{formatDate(entry.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

export function AdminDashboardPage() {
  return (
    <AdminGate>
      <AdminDashboardBody />
    </AdminGate>
  )
}

export function AdminUsersPage() {
  return (
    <AdminGate>
      <AdminUsersBody />
    </AdminGate>
  )
}

export function AdminUserDetailPage() {
  return (
    <AdminGate>
      <AdminUserDetailBody />
    </AdminGate>
  )
}

export function AdminArtifactsPage() {
  return (
    <AdminGate>
      <AdminArtifactsBody />
    </AdminGate>
  )
}

export function AdminGalleriesPage() {
  return (
    <AdminGate>
      <AdminGalleriesBody />
    </AdminGate>
  )
}

export function AdminAuditPage() {
  return (
    <AdminGate>
      <AdminAuditBody />
    </AdminGate>
  )
}

function AdminArtifactEditBody() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [artifact, setArtifact] = useState<Artifact | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [actionMessage, setActionMessage] = useState('')
  const [editForm, setEditForm] = useState({
    title: '',
    price: '',
    category: '',
    condition: 'good',
    description: '',
    history: '',
    provenance: '',
    materials: '',
    dimensions: '',
    status: 'pending',
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([])
  const [deletedGalleryIds, setDeletedGalleryIds] = useState<number[]>([])
  const galleryInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    const loadData = async () => {
      setLoading(true)
      try {
        const [artifactData, categoriesData] = await Promise.all([
          getArtifact(id),
          getCategories(),
        ])
        if (!cancelled) {
          setArtifact(artifactData)
          setCategories(categoriesData)
          setEditForm({
            title: artifactData.title,
            price: artifactData.price,
            category: String(artifactData.category || ''),
            condition: artifactData.condition || 'good',
            description: artifactData.description,
            history: artifactData.history || '',
            provenance: artifactData.provenance || '',
            materials: artifactData.materials || '',
            dimensions: artifactData.dimensions || '',
            status: artifactData.status || 'pending',
          })
          setImagePreview(resolveMarketplaceImage(artifactData))
        }
      } catch (err) {
        if (!cancelled) {
          setActionStatus('error')
          setActionMessage('Unable to load artifact data.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  function handleImagePick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleGalleryImagePick(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!artifact) return
    const existingCount = (artifact.gallery_images ?? []).filter(img => !deletedGalleryIds.includes(img.id)).length
    const totalAllowed = 3 - existingCount - newGalleryFiles.length
    const toAdd = files.slice(0, totalAllowed)
    setNewGalleryFiles((prev) => [...prev, ...toAdd])
    event.target.value = ''
  }

  function removeNewGalleryFile(index: number) {
    setNewGalleryFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function markGalleryImageDeleted(imgId: number) {
    setDeletedGalleryIds((prev) => [...prev, imgId])
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!artifact) return

    setSaving(true)
    setActionStatus('loading')
    setActionMessage('')

    try {
      const payload = new FormData()
      payload.append('title', editForm.title)
      payload.append('price', editForm.price)
      payload.append('category', editForm.category)
      payload.append('condition', editForm.condition)
      payload.append('description', editForm.description)
      payload.append('history', editForm.history)
      payload.append('provenance', editForm.provenance)
      payload.append('materials', editForm.materials)
      payload.append('dimensions', editForm.dimensions)
      payload.append('status', editForm.status)

      if (imageFile) {
        payload.append('image', imageFile)
      }

      for (const id of deletedGalleryIds) {
        payload.append('deleted_gallery_images', String(id))
      }
      for (const file of newGalleryFiles) {
        payload.append('gallery_images', file)
      }

      const updated = await updateAdminArtifact(artifact.id, payload)
      setArtifact(updated)
      setActionStatus('success')
      setActionMessage('Artifact details updated successfully.')
      setTimeout(() => navigate(`/artifacts/${artifact.id}`), 1000)
    } catch (err: any) {
      setActionStatus('error')
      let msg = 'Failed to update artifact.'
      if (err?.response?.data) {
        msg = JSON.stringify(err.response.data)
      }
      setActionMessage(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout description="Edit product metadata, category, price, and status." title="Edit Artifact">
        <div className="panel-card p-6 border border-[var(--line)] shadow-sm bg-white" style={{ borderRadius: '1rem' }}>
          <p className="text-sm text-[var(--muted)]">Loading artifact details...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!artifact) {
    return (
      <AdminLayout description="Edit product metadata, category, price, and status." title="Edit Artifact">
        <div className="empty-card p-8 text-center border border-[var(--line)] bg-white rounded-2xl shadow-sm animate-fade-in">
          <h3 className="text-lg font-semibold text-[var(--ink)]">Artifact not found</h3>
          <button className="ghost-button mt-4 border border-[var(--line)] hover:bg-slate-50 shadow-sm" onClick={() => navigate('/admin/artifacts')} type="button">
            Back to artifacts
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout description="Edit product metadata, category, price, and status." title={`Edit Artifact #${artifact.id}`}>
      <form onSubmit={handleSubmit} className="animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Editable Fields */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Card 1: General Info */}
            <div className="panel-card p-6 border border-[var(--line)] shadow-sm bg-white" style={{ borderRadius: '1rem' }}>
              <h3 className="text-base font-bold text-[#1a2035] mb-4 pb-2 border-b border-[var(--line)] flex items-center gap-2">
                <span>📝</span> General Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--ink)]">Title</label>
                  <input
                    className="text-sm px-3 py-2.5 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] transition-all"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--ink)]">Category</label>
                  <select
                    className="text-sm px-3 py-2.5 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] transition-all"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--ink)]">Price ($)</label>
                  <input
                    className="text-sm px-3 py-2.5 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] transition-all"
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--ink)]">Condition</label>
                  <select
                    className="text-sm px-3 py-2.5 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] transition-all"
                    value={editForm.condition}
                    onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                    required
                  >
                    <option value="museum">Museum</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="restored">Restored</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Card 2: Technical Specs */}
            <div className="panel-card p-6 border border-[var(--line)] shadow-sm bg-white" style={{ borderRadius: '1rem' }}>
              <h3 className="text-base font-bold text-[#1a2035] mb-4 pb-2 border-b border-[var(--line)] flex items-center gap-2">
                <span>📐</span> Technical Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--ink)]">Materials</label>
                  <input
                    className="text-sm px-3 py-2.5 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] transition-all"
                    placeholder="e.g. Bronze, Mahogany wood, Oil on canvas"
                    value={editForm.materials}
                    onChange={(e) => setEditForm({ ...editForm, materials: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--ink)]">Dimensions</label>
                  <input
                    className="text-sm px-3 py-2.5 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] transition-all"
                    placeholder="e.g. 45cm x 30cm x 15cm"
                    value={editForm.dimensions}
                    onChange={(e) => setEditForm({ ...editForm, dimensions: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-[var(--ink)]">Provenance</label>
                  <input
                    className="text-sm px-3 py-2.5 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] transition-all"
                    placeholder="e.g. Private collection, Paris; acquired in 1982"
                    value={editForm.provenance}
                    onChange={(e) => setEditForm({ ...editForm, provenance: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Descriptions */}
            <div className="panel-card p-6 border border-[var(--line)] shadow-sm bg-white" style={{ borderRadius: '1rem' }}>
              <h3 className="text-base font-bold text-[#1a2035] mb-4 pb-2 border-b border-[var(--line)] flex items-center gap-2">
                <span>📖</span> Narrative & History
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--ink)]">Description</label>
                  <textarea
                    className="text-sm px-3 py-2.5 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] transition-all h-28 resize-y"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--ink)]">Historical Background</label>
                  <textarea
                    className="text-sm px-3 py-2.5 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] transition-all h-28 resize-y"
                    placeholder="Provide historical context or narrative about this piece..."
                    value={editForm.history}
                    onChange={(e) => setEditForm({ ...editForm, history: e.target.value })}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Preview, Seller Info, Status & Actions */}
          <div className="flex flex-col gap-6">
            
            {/* Artifact Preview Frame & Image Management */}
            <div className="panel-card p-5 border border-[var(--line)] shadow-sm bg-white flex flex-col gap-4" style={{ borderRadius: '1rem' }}>
              <span className="text-xs text-[#8fa0b8] font-semibold uppercase tracking-wider">Artifact Visual & Photo</span>
              
              <div className="w-full aspect-square rounded-xl overflow-hidden border border-[var(--line)] bg-[var(--surface-soft)] shadow-inner relative group">
                {imagePreview ? (
                  <img
                    alt="Artifact preview"
                    className="w-full h-full object-cover animate-fade-in"
                    src={imagePreview}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-[var(--muted)] bg-[var(--surface-soft)]">
                    No image chosen
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`info-chip text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow border ${
                    editForm.status === 'approved' ? 'bg-emerald-500 text-white border-emerald-600' :
                    editForm.status === 'rejected' ? 'bg-rose-500 text-white border-rose-600' :
                    editForm.status === 'sold' ? 'bg-blue-500 text-white border-blue-600' :
                    'bg-amber-500 text-white border-amber-600'
                  }`}>
                    {editForm.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  className="ghost-button w-full !py-2 shadow-sm text-xs border border-[var(--line)] hover:bg-slate-50 text-center"
                  style={{ borderRadius: '0.5rem' }}
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  {imageFile ? 'Change image file' : 'Replace artifact image'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImagePick}
                  style={{ display: 'none' }}
                />
                {imageFile && (
                  <div className="flex items-center justify-between text-xs bg-[var(--surface-soft)] p-2 rounded-lg border border-[var(--line)] mt-1 animate-fade-in">
                    <span className="truncate max-w-[150px] font-medium text-[#1a2035]">{imageFile.name}</span>
                    <button
                      className="text-rose-600 hover:underline font-semibold"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview(artifact ? resolveMarketplaceImage(artifact) : '')
                      }}
                      type="button"
                    >
                      Reset to original
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Images */}
            <div className="panel-card p-5 border border-[var(--line)] shadow-sm bg-white flex flex-col gap-4" style={{ borderRadius: '1rem' }}>
              <div>
                <span className="text-xs text-[#8fa0b8] font-semibold uppercase tracking-wider block mb-1">Gallery Images</span>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Main image is required. Extra gallery images are optional and must belong to this same product. Max 4 images total (1 main + up to 3 extra).
                </p>
              </div>

              {/* Existing gallery images */}
              {(artifact.gallery_images ?? []).length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold text-[var(--ink)] uppercase tracking-wide">Existing extra images</span>
                  <div className="flex gap-2 flex-wrap">
                    {(artifact.gallery_images ?? []).map((img) => {
                      const isDeleted = deletedGalleryIds.includes(img.id)
                      return (
                        <div key={img.id} className={`relative w-20 h-20 rounded-lg overflow-hidden border ${isDeleted ? 'opacity-40 border-rose-300' : 'border-[var(--line)]'}`}>
                          <img src={img.image} alt="gallery" className="w-full h-full object-cover" />
                          {!isDeleted ? (
                            <button
                              className="absolute top-1 right-1 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow"
                              onClick={() => markGalleryImageDeleted(img.id)}
                              type="button"
                              title="Remove this image"
                            >×</button>
                          ) : (
                            <button
                              className="absolute top-1 right-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow"
                              onClick={() => setDeletedGalleryIds((prev) => prev.filter(id => id !== img.id))}
                              type="button"
                              title="Undo removal"
                            >↩</button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* New gallery images staged for upload */}
              {newGalleryFiles.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold text-[var(--ink)] uppercase tracking-wide">Staged for upload</span>
                  <div className="flex gap-2 flex-wrap">
                    {newGalleryFiles.map((file, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-blue-200 bg-blue-50">
                        <img src={URL.createObjectURL(file)} alt="new gallery" className="w-full h-full object-cover" />
                        <button
                          className="absolute top-1 right-1 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow"
                          onClick={() => removeNewGalleryFile(i)}
                          type="button"
                          title="Cancel upload"
                        >×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add gallery image button */}
              {(() => {
                const existingCount = (artifact.gallery_images ?? []).filter(img => !deletedGalleryIds.includes(img.id)).length
                const total = existingCount + newGalleryFiles.length
                return total < 3 ? (
                  <>
                    <button
                      className="ghost-button w-full !py-2 shadow-sm text-xs border border-[var(--line)] hover:bg-slate-50 text-center"
                      style={{ borderRadius: '0.5rem' }}
                      onClick={() => galleryInputRef.current?.click()}
                      type="button"
                    >
                      + Add gallery image ({total}/3 extra)
                    </button>
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryImagePick}
                      style={{ display: 'none' }}
                    />
                  </>
                ) : (
                  <p className="text-[11px] text-amber-600 font-medium">Maximum 3 extra images reached.</p>
                )
              })()}
            </div>

            {/* Seller Information */}
            <div className="panel-card p-5 border border-[var(--line)] shadow-sm bg-white" style={{ borderRadius: '1rem' }}>
              <span className="text-xs text-[#8fa0b8] font-semibold uppercase tracking-wider block mb-3">Seller Details</span>
              <div className="bg-[var(--surface-soft)] p-3 rounded-xl border border-[var(--line)] flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[#8fa0b8] uppercase tracking-wider">Seller Email</span>
                <span className="text-xs font-semibold text-[#1a2035] break-all">{artifact.seller_email || 'Verified Seller'}</span>
              </div>
            </div>

            {/* Moderation Controls */}
            <div className="panel-card p-5 border border-[var(--line)] shadow-sm bg-white flex flex-col gap-4" style={{ borderRadius: '1rem' }}>
              <span className="text-xs text-[#8fa0b8] font-semibold uppercase tracking-wider">Moderation Control</span>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--ink)]">Change Listing Status</label>
                <select
                  className="text-sm px-3 py-2.5 border border-[var(--line)] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#4658c6] transition-all"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  required
                >
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approved / Live</option>
                  <option value="rejected">Rejected</option>
                  <option value="draft">Draft</option>
                  <option value="sold">Sold</option>
                </select>
              </div>

              {actionMessage && (
                <div className={`text-xs py-2 px-3 border rounded-xl ${actionStatus === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  {actionMessage}
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--line)]">
                <button 
                  className="solid-button w-full !py-2.5 shadow-sm text-sm" 
                  style={{ borderRadius: '0.75rem' }} 
                  disabled={saving} 
                  type="submit"
                >
                  {saving ? 'Saving changes...' : 'Save Changes'}
                </button>
                <Link 
                  className="ghost-button w-full !py-2.5 shadow-sm text-sm border border-[var(--line)] hover:bg-slate-50 text-center block" 
                  style={{ borderRadius: '0.75rem' }} 
                  to={`/artifacts/${artifact.id}`}
                >
                  Cancel
                </Link>
              </div>
            </div>

          </div>

        </div>
      </form>
    </AdminLayout>
  )
}

export function AdminArtifactEditPage() {
  return (
    <AdminGate>
      <AdminArtifactEditBody />
    </AdminGate>
  )
}
