import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, NavLink, useLocation } from 'react-router-dom'
import { changePassword, updateCurrentUser } from './api'
import { useAuth } from './auth'
import { currentUserAvatarPath, currentUserDisplayName, UserAvatar } from './messageIdentity'
import { getDashboardPathForRole } from './roleRouting'

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
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const formRef = useRef<HTMLFormElement | null>(null)
  const [profileForm, setProfileForm] = useState({
    email: user?.email ?? '',
    display_name: user?.first_name ?? '',
    username: user?.username ?? '',
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState(user ? currentUserAvatarPath(user) : '')
  const [removeAvatar, setRemoveAvatar] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [profileStatus, setProfileStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const currentName = currentUserDisplayName(user, 'Member')
  const currentAvatar = avatarPreview || currentUserAvatarPath(user)
  const dashboardPath = getDashboardPathForRole(user?.role)



  const accountLinks = useMemo(() => {
    const links = [{ to: '/account', label: 'Account settings' }]

    if (user?.role === 'buyer') {
      links.unshift({ to: '/collector', label: 'Collector dashboard' })
      links.push({ to: '/collector/messages', label: 'Messages' })
      links.push({ to: '/wishlist', label: 'Wishlist' })
      links.push({ to: '/orders', label: 'Orders' })
    }

    if (user?.role === 'seller') {
      links.unshift({ to: '/seller', label: 'Seller dashboard' })
      links.push({ to: '/seller/messages', label: 'Messages' })
      links.push({ to: '/seller/products', label: 'Products' })
      links.push({ to: '/seller/orders', label: 'Orders received' })
      links.push({ to: '/seller/galleries', label: 'Galleries' })
    }

    if (user?.role === 'admin') {
      links.unshift({ to: '/admin', label: 'Admin dashboard' })
      links.push({ to: '/admin/users', label: 'Users' })
      links.push({ to: '/admin/artifacts', label: 'Artifacts' })
      links.push({ to: '/admin/galleries', label: 'Galleries' })
    }

    links.push({ to: '/', label: 'Back to catalogue' })
    return links
  }, [user?.role])

  useEffect(() => {
    setProfileForm({
      email: user?.email ?? '',
      display_name: user?.first_name ?? '',
      username: user?.username ?? '',
    })
    setAvatarPreview(user ? currentUserAvatarPath(user) : '')
    setAvatarFile(null)
    setRemoveAvatar(false)
  }, [user])

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  function updateProfileField(field: keyof typeof profileForm, value: string) {
    setProfileForm((current) => ({ ...current, [field]: value }))
  }

  function updatePasswordField(field: keyof typeof passwordForm, value: string) {
    setPasswordForm((current) => ({ ...current, [field]: value }))
  }

  function handleAvatarPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview)
    }

    setAvatarFile(file)
    setRemoveAvatar(false)
    setAvatarPreview(URL.createObjectURL(file))
  }

  function handleAvatarRemove() {
    if (avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview)
    }
    setAvatarFile(null)
    setAvatarPreview('')
    setRemoveAvatar(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProfileStatus('loading')
    setProfileMessage('')

    try {
      // Map display_name to first_name for backend compatibility
      const payload: any = {
        email: profileForm.email,
        first_name: profileForm.display_name,
        // username not mapped to backend by default
      }
      if (avatarFile) payload.avatar_image = avatarFile
      if (removeAvatar) payload.remove_avatar = true

      const updated = await updateCurrentUser(payload)
      updateUser(updated)
      setProfileStatus('success')
      setProfileMessage('Profile updated successfully.')
      setAvatarFile(null)
      setRemoveAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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
    <main className="dashboard-page dashboard-page--workspace">
      <aside className="dashboard-rail dashboard-rail--workspace">
        <div className="dashboard-user dashboard-user--workspace">
          <UserAvatar
            avatarPath={currentAvatar}
            className="dashboard-avatar-frame"
            initialsClassName="text-lg font-semibold uppercase tracking-[0.16em] text-white"
            label={currentName}
          />
          <div>
            <strong>{currentName}</strong>
            <span className="dashboard-role-chip">{user?.role}</span>
          </div>
          <p>Shape how your profile appears across marketplace messages, dashboards, and seller or collector threads.</p>
        </div>

        <nav className="dashboard-nav dashboard-nav--workspace" aria-label="Account navigation">
          {accountLinks.map((link) =>
            link.to === '/' ? (
              <Link key={link.to} to={link.to}>
                <span>{link.label}</span>
              </Link>
            ) : (
              <NavLink key={link.to} to={link.to}>
                <span>{link.label}</span>
              </NavLink>
            ),
          )}
        </nav>

        <div className="dashboard-rail-footer">
          <Link className="dashboard-cta-button" to={dashboardPath}>
            Open workspace
          </Link>
        </div>
      </aside>

      <section className="dashboard-content dashboard-content--workspace">
        <div className="dashboard-header dashboard-header--workspace dashboard-header--compact">
          <div>
            <p className="eyebrow">Profile management</p>
            <h1>Account settings</h1>
            <p className="dashboard-header-copy">A cleaner identity workspace for your visible name, profile photo, and access details.</p>
          </div>
          <div className="dashboard-header-actions">
            <Link className="ghost-button" to={dashboardPath}>
              Open dashboard
            </Link>
            <button className="ghost-button" onClick={logout} type="button">
              Log out
            </button>
          </div>
        </div>
        <div className="dashboard-shell-body">
          <div className="dashboard-grid dashboard-grid--account">
            <div className="account-left-col">
              <section className="panel-card account-profile-hero account-profile-hero--compact">
                <div className="flex items-center justify-between gap-4 p-1">
                  <div className="flex items-center gap-5">
                    <UserAvatar
                      avatarPath={currentAvatar}
                      className="account-profile-avatar"
                      initialsClassName="text-2xl font-semibold uppercase tracking-[0.18em] text-white"
                      label={currentName}
                    />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <h2 className="mb-0 text-xl font-semibold text-[var(--ink)]">{currentName}</h2>
                        <span className="info-chip">Active</span>
                        <span className="info-chip capitalize">{user?.role}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[#5c6c82] text-sm">@{user?.username || profileForm.username || 'username'}</span>
                        <span className="text-[#5c6c82] text-sm">&bull;</span>
                        <span className="text-[#5c6c82] text-sm">{user?.email || profileForm.email || 'email@example.com'}</span>
                        <span className="text-[#5c6c82] text-sm">&bull;</span>
                        <span className="text-[#5c6c82] text-sm">Member since {user?.profile?.created_at ? new Date(user.profile.created_at).toLocaleDateString() : '—'}</span>
                      </div>
                      {avatarFile ? <p className="account-file-meta mt-1">{avatarFile.name}</p> : null}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="ghost-button" style={{ minHeight: '2rem', padding: '0 0.8rem', fontSize: '0.85rem', borderRadius: '0.4rem', border: '1px solid var(--line)' }} onClick={() => fileInputRef.current?.click()} type="button">Edit photo</button>
                    {avatarPreview ? (
                      <button className="ghost-button" style={{ minHeight: '2rem', padding: '0 0.8rem', fontSize: '0.85rem', borderRadius: '0.4rem', border: '1px solid var(--line)', color: '#d63939' }} onClick={handleAvatarRemove} type="button">Remove</button>
                    ) : null}
                    <input ref={fileInputRef} onChange={handleAvatarPick} accept="image/*" type="file" style={{ display: 'none' }} />
                  </div>
                </div>
                {/* metrics removed for compact profile hero (show in dashboard panels instead) */}
              </section>

              <section className="panel-card">
                <form ref={formRef} className="editor-card account-editor-card account-editor-card--compact" onSubmit={handleProfileSubmit} style={{ padding: '1.25rem' }}>
                  <div className="editor-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <label>
                      Display name
                      <input onChange={(event) => updateProfileField('display_name', event.target.value)} required value={profileForm.display_name} />
                    </label>
                    <label>
                      Username
                      <div className="username-readonly" style={{ padding: '0.65rem 0.8rem', border: '1px solid var(--line)', borderRadius: '0.6rem', background: 'var(--surface-soft)', color: 'var(--muted)', fontSize: '0.92rem' }}>@{profileForm.username}</div>
                    </label>
                    <label style={{ gridColumn: '1 / -1' }}>
                      Email
                      <input onChange={(event) => updateProfileField('email', event.target.value)} required type="email" value={profileForm.email} />
                    </label>
                  </div>
                  <div className="editor-actions mt-4" style={{ justifyContent: 'flex-end', display: 'flex' }}>
                    <button className="solid-button" disabled={profileStatus === 'loading'} type="submit" style={{ minHeight: '2.5rem', padding: '0 1.5rem', borderRadius: '0.6rem' }}>{profileStatus === 'loading' ? 'Saving...' : 'Save profile'}</button>
                  </div>
                  {profileMessage ? <p className={profileStatus === 'error' ? 'error-message' : 'success-message'}>{profileMessage}</p> : null}
                </form>
              </section>
            </div>

            <aside className="account-right-col" style={{ gap: '0.8rem' }}>
              <section className="panel-card" style={{ padding: '1rem 1.25rem' }}>
                <div className="panel-head" style={{ marginBottom: '0.2rem' }}>
                  <div>
                    <p className="eyebrow" style={{ marginBottom: '0.2rem' }}>Security</p>
                    <h2 style={{ fontSize: '1.1rem' }}>Two-Factor Auth</h2>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-[var(--surface-soft)] p-3 rounded-lg border border-[var(--line)]">
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>Protect your account</strong>
                    <p className="text-xs text-[#5c6c82] m-0 mt-0.5">Add an extra layer of security.</p>
                  </div>
                  <button className="solid-button" style={{ minHeight: '2rem', padding: '0 1rem', fontSize: '0.8rem', borderRadius: '0.5rem' }} onClick={() => alert('2FA not implemented')} type="button">Enable 2FA</button>
                </div>
              </section>

              <section className="panel-card" style={{ padding: '1rem 1.25rem' }}>
                <div className="panel-head" style={{ marginBottom: '0.2rem' }}>
                  <div>
                    <p className="eyebrow" style={{ marginBottom: '0.2rem' }}>Security</p>
                    <h2 style={{ fontSize: '1.1rem' }}>Change password</h2>
                  </div>
                </div>
                <form onSubmit={handlePasswordSubmit} style={{ display: 'grid', gap: '0.8rem' }}>
                  <div style={{ display: 'grid', gap: '0.6rem' }}>
                    <label style={{ fontSize: '0.85rem', display: 'grid', gap: '0.3rem' }}>
                      Current password
                      <input style={{ padding: '0.5rem 0.6rem', fontSize: '0.9rem', borderRadius: '0.5rem', border: '1px solid var(--line)' }} onChange={(event) => updatePasswordField('current_password', event.target.value)} required type="password" value={passwordForm.current_password} />
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                      <label style={{ fontSize: '0.85rem', display: 'grid', gap: '0.3rem' }}>
                        New password
                        <input style={{ padding: '0.5rem 0.6rem', fontSize: '0.9rem', borderRadius: '0.5rem', border: '1px solid var(--line)' }} minLength={8} onChange={(event) => updatePasswordField('new_password', event.target.value)} required type="password" value={passwordForm.new_password} />
                      </label>
                      <label style={{ fontSize: '0.85rem', display: 'grid', gap: '0.3rem' }}>
                        Confirm password
                        <input style={{ padding: '0.5rem 0.6rem', fontSize: '0.9rem', borderRadius: '0.5rem', border: '1px solid var(--line)' }} minLength={8} onChange={(event) => updatePasswordField('confirm_password', event.target.value)} required type="password" value={passwordForm.confirm_password} />
                      </label>
                    </div>
                  </div>
                  <div className="editor-actions mt-2" style={{ justifyContent: 'flex-end', display: 'flex' }}>
                    <button className="solid-button" disabled={passwordStatus === 'loading'} type="submit" style={{ minHeight: '2.2rem', padding: '0 1rem', fontSize: '0.85rem', borderRadius: '0.5rem' }}>{passwordStatus === 'loading' ? 'Updating...' : 'Change password'}</button>
                  </div>
                  {passwordMessage ? <p className={passwordStatus === 'error' ? 'error-message text-sm' : 'success-message text-sm'}>{passwordMessage}</p> : null}
                </form>
              </section>

              <section className="panel-card" style={{ padding: '1rem 1.25rem' }}>
                <div className="panel-head" style={{ marginBottom: '0.2rem' }}>
                  <div>
                    <p className="eyebrow" style={{ marginBottom: '0.2rem' }}>Danger zone</p>
                    <h2 style={{ fontSize: '1.1rem' }}>Account controls</h2>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="ghost-button flex-1" style={{ minHeight: '2.2rem', fontSize: '0.85rem', borderRadius: '0.5rem' }} onClick={() => { if (confirm('Deactivate account?')) alert('Not implemented') }} type="button">Deactivate</button>
                  <button className="solid-button flex-1" onClick={() => { if (confirm('Delete account permanently?')) alert('Not implemented') }} type="button" style={{ background: '#d63939', borderColor: '#d63939', minHeight: '2.2rem', fontSize: '0.85rem', borderRadius: '0.5rem' }}>Delete account</button>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}
