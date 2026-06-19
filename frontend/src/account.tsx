import { type FormEvent, type ReactNode, useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { changePassword, updateCurrentUser } from './api'
import { useAuth } from './auth'

function AccountGate({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { status, user } = useAuth()

  if (status === 'loading') {
    return (
      <main className="empty-page">
        <section className="empty-card">
          <p className="eyebrow">Account access</p>
          <h1>Loading your profile...</h1>
        </section>
      </main>
    )
  }

  if (!user) {
    return <Navigate replace state={{ redirectTo: location.pathname }} to="/login" />
  }

  return children
}

export function AccountPage() {
  return (
    <AccountGate>
      <AccountPageBody />
    </AccountGate>
  )
}

function AccountPageBody() {
  const { user, updateUser, logout } = useAuth()
  const [profileForm, setProfileForm] = useState({
    email: user?.email ?? '',
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    avatar_3d_path: user?.profile?.avatar_3d_path ?? '',
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [profileStatus, setProfileStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    setProfileForm({
      email: user?.email ?? '',
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      avatar_3d_path: user?.profile?.avatar_3d_path ?? '',
    })
  }, [user])

  function updateProfileField(field: keyof typeof profileForm, value: string) {
    setProfileForm((current) => ({ ...current, [field]: value }))
  }

  function updatePasswordField(field: keyof typeof passwordForm, value: string) {
    setPasswordForm((current) => ({ ...current, [field]: value }))
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProfileStatus('loading')
    setProfileMessage('')

    try {
      const updated = await updateCurrentUser(profileForm)
      updateUser(updated)
      setProfileStatus('success')
      setProfileMessage('Profile updated successfully.')
    } catch {
      setProfileStatus('error')
      setProfileMessage('Unable to update your profile right now.')
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordStatus('loading')
    setPasswordMessage('')

    try {
      await changePassword(passwordForm)
      setPasswordStatus('success')
      setPasswordMessage('Password changed successfully.')
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
    } catch {
      setPasswordStatus('error')
      setPasswordMessage('Unable to change your password right now.')
    }
  }

  return (
    <main className="dashboard-page">
      <aside className="dashboard-rail">
        <Link className="brand-mark" to="/">
          Artisan&apos;s Echo
        </Link>
        <div className="dashboard-user">
          <strong>{user?.first_name || user?.email}</strong>
          <span>{user?.role}</span>
          <p>View and manage your account details.</p>
        </div>
        <nav className="dashboard-nav" aria-label="Account navigation">
          {user?.role === 'buyer' && <Link to="/collector">Collector dashboard</Link>}
          {user?.role === 'seller' && <Link to="/seller">Seller dashboard</Link>}
          {user?.role === 'seller' && <Link to="/seller/orders">Orders received</Link>}
          {user?.role === 'admin' && <Link to="/admin">Admin dashboard</Link>}
          <Link to="/account">Profile</Link>
          {user?.role === 'buyer' && <Link to="/wishlist">Wishlist</Link>}
          {user?.role === 'buyer' && <Link to="/orders">Orders</Link>}
        </nav>
        <button className="ghost-button" onClick={logout} type="button">
          Log out
        </button>
      </aside>

      <section className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <p className="eyebrow">Profile management</p>
            <h1>Account settings</h1>
          </div>
          <Link className="ghost-button" to="/">
            Back to catalogue
          </Link>
        </div>

        <div className="dashboard-grid">
          <section className="panel-card">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Profile summary</p>
                <h2>{user?.email}</h2>
              </div>
            </div>
            <div className="metric-row">
              <article>
                <strong>{user?.role}</strong>
                <span>Role</span>
              </article>
              <article>
                <strong>{user?.profile?.avatar_3d_path ? 'Custom' : 'Default'}</strong>
                <span>Avatar path</span>
              </article>
              <article>
                <strong>{user?.profile?.created_at ? new Date(user.profile.created_at).toLocaleDateString() : '—'}</strong>
                <span>Profile created</span>
              </article>
            </div>
          </section>

          <section className="panel-card">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Profile editing</p>
                <h2>View and edit profile</h2>
              </div>
            </div>
            <form className="editor-card" onSubmit={handleProfileSubmit}>
              <div className="editor-grid">
                <label>
                  Email
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(event) => updateProfileField('email', event.target.value)}
                    required
                  />
                </label>
                <label>
                  First name
                  <input
                    value={profileForm.first_name}
                    onChange={(event) => updateProfileField('first_name', event.target.value)}
                    required
                  />
                </label>
                <label>
                  Last name
                  <input
                    value={profileForm.last_name}
                    onChange={(event) => updateProfileField('last_name', event.target.value)}
                    required
                  />
                </label>
                <label>
                  Avatar path
                  <input
                    value={profileForm.avatar_3d_path}
                    onChange={(event) => updateProfileField('avatar_3d_path', event.target.value)}
                    placeholder="/avatars/my-avatar.glb"
                  />
                </label>
              </div>
              <button className="solid-button" disabled={profileStatus === 'loading'} type="submit">
                {profileStatus === 'loading' ? 'Saving...' : 'Save profile'}
              </button>
            </form>
            {profileMessage && (
              <p className={profileStatus === 'error' ? 'error-message' : 'success-message'}>
                {profileMessage}
              </p>
            )}
          </section>

          <section className="panel-card">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Password</p>
                <h2>Change password</h2>
              </div>
            </div>
            <form className="editor-card" onSubmit={handlePasswordSubmit}>
              <div className="editor-grid">
                <label>
                  Current password
                  <input
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(event) => updatePasswordField('current_password', event.target.value)}
                    required
                  />
                </label>
                <label>
                  New password
                  <input
                    type="password"
                    minLength={8}
                    value={passwordForm.new_password}
                    onChange={(event) => updatePasswordField('new_password', event.target.value)}
                    required
                  />
                </label>
                <label>
                  Confirm password
                  <input
                    type="password"
                    minLength={8}
                    value={passwordForm.confirm_password}
                    onChange={(event) => updatePasswordField('confirm_password', event.target.value)}
                    required
                  />
                </label>
              </div>
              <button className="solid-button" disabled={passwordStatus === 'loading'} type="submit">
                {passwordStatus === 'loading' ? 'Updating...' : 'Change password'}
              </button>
            </form>
            {passwordMessage && (
              <p className={passwordStatus === 'error' ? 'error-message' : 'success-message'}>
                {passwordMessage}
              </p>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}
