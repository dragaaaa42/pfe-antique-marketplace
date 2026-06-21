import { type FormEvent, type ReactNode, useEffect, useState } from 'react'
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
        <nav className="dashboard-nav dashboard-nav--workspace" aria-label="Admin navigation">
          <NavLink end to="/admin">
            Dashboard
          </NavLink>
          <NavLink to="/admin/users">Users</NavLink>
          <NavLink to="/admin/artifacts">Artifacts</NavLink>
          <NavLink to="/admin/audit">Audit trail</NavLink>
          <NavLink end to="/">Catalogue</NavLink>
        </nav>
        <div className="dashboard-rail-footer">
          <Link className="dashboard-cta-button" to="/admin/users">
            Review users
          </Link>
        </div>
      </aside>
      <section className="dashboard-content dashboard-content--workspace">
        <div className="dashboard-header dashboard-header--workspace">
          <div>
            <p className="eyebrow">Administration workspace</p>
            <h1>{title}</h1>
            <p className="dashboard-header-copy">Moderation, users, and artifact approvals live in one cleaner control surface.</p>
          </div>
          <div className="dashboard-header-actions">
            <Link className="ghost-button" to="/">
              Back to catalogue
            </Link>
            <button className="ghost-button" onClick={logout} type="button">
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
      <div className="panel-card">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Platform overview</p>
            <h2>Administration summary</h2>
          </div>
          <button className="ghost-button" onClick={() => void refresh()} type="button">
            Refresh
          </button>
        </div>
        {loading && <p>Loading admin dashboard...</p>}
        {error && <p className="error-message">{error}</p>}
        {data && (
          <>
            <div className="metric-row">
              <article>
                <strong>{data.stats.total_users}</strong>
                <span>Total users</span>
              </article>
              <article>
                <strong>{data.stats.total_sellers}</strong>
                <span>Total sellers</span>
              </article>
              <article>
                <strong>{data.stats.total_artifacts}</strong>
                <span>Total artifacts</span>
              </article>
              
              <article>
                <strong>{data.stats.total_orders}</strong>
                <span>Total orders</span>
              </article>
              <article>
                <strong>{data.stats.pending_artifacts}</strong>
                <span>Pending artifacts</span>
              </article>
              <article>
                <strong>{data.stats.published_artifacts}</strong>
                <span>Published artifacts</span>
              </article>
            </div>
            <div className="dashboard-grid">
              <section className="panel-card">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Moderation queue</p>
                    <h3>Pending artifacts</h3>
                  </div>
                  <Link className="text-link" to="/admin/artifacts">
                    Open moderation
                  </Link>
                </div>
                <div className="table-shell">
                  <table className="management-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Artifact</th>
                        <th>Seller</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.pending_artifacts.map((artifact) => (
                        <tr key={artifact.id}>
                          <td>
                            <MarketplaceImage
                              alt={artifact.title}
                              className="table-thumb"
                              loading="eager"
                              src={resolveMarketplaceImage(artifact)}
                            />
                          </td>
                          <td>{artifact.title}</td>
                          <td>{artifact.seller_email || 'Unknown seller'}</td>
                          <td>{formatPrice(artifact.price)}</td>
                          <td>
                            <span className={`status-pill status-${artifact.status}`}>{artifact.status}</span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <Link className="text-link" to={`/artifacts/${artifact.id}`}>
                                View
                              </Link>
                              <Link className="text-link" to="/admin/artifacts">
                                Moderate
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section className="panel-card">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Recent actions</p>
                    <h3>Audit trail preview</h3>
                  </div>
                  <Link className="text-link" to="/admin/audit">
                    Open log
                  </Link>
                </div>
                <div className="table-shell">
                  <table className="management-table">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Target</th>
                        <th>Admin</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_actions.map((entry) => (
                        <tr key={entry.id}>
                          <td>{entry.action_type}</td>
                          <td>
                            {entry.target_model} #{entry.target_id}
                          </td>
                          <td>{entry.admin_email}</td>
                          <td>{formatDate(entry.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
            <div className="dashboard-grid">
              <section className="panel-card">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Users</p>
                    <h3>Recent accounts</h3>
                  </div>
                  <Link className="text-link" to="/admin/users">
                    Manage users
                  </Link>
                </div>
                <div className="table-shell">
                  <table className="management-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_users.map((adminUser) => (
                        <tr key={adminUser.id}>
                          <td>
                            {adminUser.first_name || adminUser.last_name
                              ? `${adminUser.first_name} ${adminUser.last_name}`.trim()
                              : adminUser.email}
                          </td>
                          <td>{adminUser.email}</td>
                          <td>{adminUser.role}</td>
                          <td>{adminUser.is_active ? 'Active' : 'Disabled'}</td>
                          <td>{formatDate(adminUser.date_joined)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section className="panel-card">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Gallery review</p>
                    <h3>Recent galleries</h3>
                  </div>
                  <Link className="text-link" to="/admin/galleries">
                    Review galleries
                  </Link>
                </div>
                <div className="table-shell">
                  <table className="management-table">
                    <thead>
                      <tr>
                        <th>Gallery</th>
                        <th>Owner</th>
                        <th>Theme</th>
                        <th>Visibility</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_galleries.map((gallery) => (
                        <tr key={gallery.id}>
                          <td>{gallery.name}</td>
                          <td>{gallery.owner_email || 'Unknown owner'}</td>
                          <td>{gallery.theme || 'No theme'}</td>
                          <td>{gallery.is_public ? 'Public' : 'Private'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
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
  const [message, setMessage] = useState('')

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

  async function toggleActive(user: AdminUser) {
    try {
      const updated = await updateAdminUser(user.id, { is_active: !user.is_active })
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      setMessage(`${updated.email} is now ${updated.is_active ? 'enabled' : 'disabled'}.`)
    } catch {
      setMessage('Could not update this account right now.')
    }
  }

  return (
    <AdminLayout description="Search, review, and control marketplace accounts." title="Users">
      <div className="panel-card">
        <div className="panel-head">
          <div>
            <p className="eyebrow">User management</p>
            <h2>All accounts</h2>
          </div>
          <button className="ghost-button" onClick={() => void refresh()} type="button">
            Refresh
          </button>
        </div>

        <form className="editor-card" onSubmit={(event: FormEvent<HTMLFormElement>) => event.preventDefault()}>
          <div className="editor-grid">
            <label>
              Search
              <input
                placeholder="Email or name"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <label>
              Role
              <select value={role} onChange={(event) => setRole(event.target.value as '' | AdminUser['role'])}>
                <option value="">All roles</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label>
              Account status
              <select value={active} onChange={(event) => setActive(event.target.value as '' | 'true' | 'false')}>
                <option value="">All accounts</option>
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </label>
          </div>
        </form>

        {message && <p className="success-message">{message}</p>}
        {loading && <p>Loading users...</p>}
        {error && <p className="error-message">{error}</p>}
        <div className="table-shell">
          <table className="management-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    {user.first_name || user.last_name
                      ? `${user.first_name} ${user.last_name}`.trim()
                      : user.email}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.is_active ? 'Active' : 'Disabled'}</td>
                  <td>{formatDate(user.date_joined)}</td>
                  <td>
                    <div className="table-actions">
                      <Link className="text-link" to={`/admin/users/${user.id}`}>
                        Details
                      </Link>
                      <button className="text-link" onClick={() => toggleActive(user)} type="button">
                        {user.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
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

function AdminUserDetailBody() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage('')

    try {
      const updated = await updateAdminUser(user.id, {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: user.is_active,
      })
      setUser(updated)
      setMessage('User profile updated.')
    } catch {
      setMessage('Unable to update this user right now.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout description="Inspect account details and permissions." title="User details">
        <div className="panel-card">
          <p>Loading user...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!user) {
    return (
      <AdminLayout description="Inspect account details and permissions." title="User details">
        <div className="empty-card">
          <h3>User not found</h3>
          <button className="ghost-button" onClick={() => navigate('/admin/users')} type="button">
            Back to users
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout description="Inspect account details and permissions." title={`User #${user.id}`}>
      <div className="panel-card">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Account details</p>
            <h2>{user.email}</h2>
          </div>
          <Link className="ghost-button" to="/admin/users">
            Back to users
          </Link>
        </div>

        <form className="editor-card" onSubmit={handleSubmit}>
          <div className="editor-grid">
            <label>
              First name
              <input
                value={user.first_name}
                onChange={(event) => setUser((current) => (current ? { ...current, first_name: event.target.value } : current))}
              />
            </label>
            <label>
              Last name
              <input
                value={user.last_name}
                onChange={(event) => setUser((current) => (current ? { ...current, last_name: event.target.value } : current))}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={user.email}
                onChange={(event) => setUser((current) => (current ? { ...current, email: event.target.value } : current))}
              />
            </label>
            <label>
              Role
              <select
                value={user.role}
                onChange={(event) => setUser((current) => (current ? { ...current, role: event.target.value as AdminUser['role'] } : current))}
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label>
              Account status
              <select
                value={String(user.is_active)}
                onChange={(event) =>
                  setUser((current) => (current ? { ...current, is_active: event.target.value === 'true' } : current))
                }
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </label>
          </div>
          <div className="editor-actions">
            <button className="solid-button" disabled={saving} type="submit">
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>

        {message && <p className="success-message">{message}</p>}

        <div className="metric-row">
          <article>
            <strong>{user.role}</strong>
            <span>Current role</span>
          </article>
          <article>
            <strong>{user.is_active ? 'Enabled' : 'Disabled'}</strong>
            <span>Account status</span>
          </article>
          <article>
            <strong>{formatDate(user.date_joined)}</strong>
            <span>Date joined</span>
          </article>
        </div>
      </div>
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
      <div className="panel-card">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Artifact moderation</p>
            <h2>Listing review queue</h2>
          </div>
          <button className="ghost-button" onClick={() => void refresh()} type="button">
            Refresh
          </button>
        </div>

        <div className="editor-card">
          <div className="editor-grid">
            <label>
              Search
              <input
                placeholder="Title, seller, or category"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <label>
              Status
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
                <option value="sold">Sold</option>
              </select>
            </label>
          </div>
        </div>

        {loading && <p>Loading artifacts...</p>}
        {error && <p className="error-message">{error}</p>}
        <div className="table-shell">
          <table className="management-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Artifact</th>
                <th>Seller</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {artifacts.map((artifact) => (
                <tr key={artifact.id}>
                  <td>
                    <MarketplaceImage
                      alt={artifact.title}
                      className="table-thumb"
                      loading="eager"
                      src={resolveMarketplaceImage(artifact)}
                    />
                  </td>
                  <td>{artifact.title}</td>
                  <td>{artifact.seller_email || 'Unknown seller'}</td>
                  <td>{artifact.category_name ?? 'Uncategorized'}</td>
                  <td>{formatPrice(artifact.price)}</td>
                  <td>
                    <span className={`status-pill status-${artifact.status}`}>{artifact.status}</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link className="text-link" to={`/artifacts/${artifact.id}`}>
                        Preview
                      </Link>
                      <button className="text-link" onClick={() => void handleApprove(artifact)} type="button">
                        Approve
                      </button>
                      <button className="text-link" onClick={() => void handleReject(artifact)} type="button">
                        Reject
                      </button>
                    </div>
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
      <div className="panel-card">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Gallery moderation</p>
            <h2>All galleries</h2>
          </div>
          <button className="ghost-button" onClick={() => void refresh()} type="button">
            Refresh
          </button>
        </div>

        <div className="editor-card">
          <label>
            Search
            <input
              placeholder="Name, theme, owner"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>

        {loading && <p>Loading galleries...</p>}
        {error && <p className="error-message">{error}</p>}
        <div className="table-shell">
          <table className="management-table">
            <thead>
              <tr>
                <th>Gallery</th>
                <th>Owner</th>
                <th>Theme</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {galleries.map((gallery) => (
                <tr key={gallery.id}>
                  <td>{gallery.name}</td>
                  <td>{gallery.owner_email || 'Unknown owner'}</td>
                  <td>{gallery.theme || 'No theme'}</td>
                  <td>{gallery.is_public ? 'Public' : 'Private'}</td>
                  <td>
                    <button className="text-link" onClick={() => void handleDelete(gallery)} type="button">
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
      <div className="panel-card">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Audit log</p>
            <h2>Moderation history</h2>
          </div>
          <button className="ghost-button" onClick={() => void refresh()} type="button">
            Refresh
          </button>
        </div>

        <div className="editor-card">
          <div className="editor-grid">
            <label>
              Search
              <input
                placeholder="Target, admin, or note"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <label>
              Action type
              <select value={actionType} onChange={(event) => setActionType(event.target.value)}>
                <option value="">All actions</option>
                <option value="artifact_approved">Artifact approved</option>
                <option value="artifact_rejected">Artifact rejected</option>
                <option value="artifact_deleted">Artifact deleted</option>
                <option value="gallery_deleted">Gallery deleted</option>
                <option value="user_role_changed">User role changed</option>
                <option value="user_disabled">User disabled</option>
                <option value="user_enabled">User enabled</option>
              </select>
            </label>
          </div>
        </div>

        {loading && <p>Loading audit trail...</p>}
        {error && <p className="error-message">{error}</p>}
        <div className="table-shell">
          <table className="management-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Target</th>
                <th>Admin</th>
                <th>Notes</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.action_type}</td>
                  <td>
                    {entry.target_model} #{entry.target_id}
                  </td>
                  <td>{entry.admin_email}</td>
                  <td>{entry.notes || '—'}</td>
                  <td>{formatDate(entry.created_at)}</td>
                </tr>
              ))}
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
