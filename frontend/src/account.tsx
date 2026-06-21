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

  const hasChanges =
    profileForm.display_name !== (user?.first_name ?? '') ||
    profileForm.email !== (user?.email ?? '') ||
    !!avatarFile ||
    removeAvatar

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
                <div className="account-profile-hero__visual">
                  <div className="account-profile-hero__left">
                    <UserAvatar
                      avatarPath={currentAvatar}
                      className="account-profile-avatar"
                      initialsClassName="text-2xl font-semibold uppercase tracking-[0.18em] text-white"
                      label={currentName}
                    />
                    <div className="avatar-actions">
                      <button className="ghost-button" onClick={() => fileInputRef.current?.click()} type="button">Edit photo</button>
                      {avatarPreview ? (
                        <button className="ghost-button" onClick={handleAvatarRemove} type="button">Remove</button>
                      ) : null}
                    </div>
                    <input ref={fileInputRef} onChange={handleAvatarPick} accept="image/*" type="file" style={{ display: 'none' }} />
                  </div>

                  <div className="account-profile-hero__right">
                    <div className="account-profile-hero__title">
                      <h2 className="mb-0">{currentName}</h2>
                      <span className="dashboard-role-chip">{user?.role}</span>
                    </div>
                    <p className="mt-1 text-sm text-[#dfe8ff]">Member since {user?.profile?.created_at ? new Date(user.profile.created_at).toLocaleDateString() : '—'}</p>
                    {avatarFile ? <p className="account-file-meta">{avatarFile.name}</p> : null}
                  </div>
                </div>
                {/* metrics removed for compact profile hero (show in dashboard panels instead) */}
              </section>

              <section className="panel-card">
                <form ref={formRef} className="editor-card account-editor-card account-editor-card--compact" onSubmit={handleProfileSubmit}>
                  <div className="editor-grid">
                    <label>
                      Display name
                      <input onChange={(event) => updateProfileField('display_name', event.target.value)} required value={profileForm.display_name} />
                    </label>
                    <label>
                      Username
                      <div className="username-readonly">@{profileForm.username}</div>
                    </label>
                    <label>
                      Email
                      <input onChange={(event) => updateProfileField('email', event.target.value)} required type="email" value={profileForm.email} />
                    </label>
                  </div>
                  <div className="editor-actions mt-4">
                    <button className="solid-button" disabled={profileStatus === 'loading'} type="submit">{profileStatus === 'loading' ? 'Saving...' : 'Save profile'}</button>
                  </div>
                  {profileMessage ? <p className={profileStatus === 'error' ? 'error-message' : 'success-message'}>{profileMessage}</p> : null}
                </form>
              </section>
            </div>

            <aside className="account-right-col">
              <section className="panel-card">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Security</p>
                    <h2>Two-Factor Authentication</h2>
                  </div>
                </div>
                <div className="form-section">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>Two-Factor Authentication</strong>
                      <p className="text-sm text-[#5c6c82]">Add an extra layer of account security.</p>
                    </div>
                    <div>
                      <button className="solid-button" onClick={() => alert('2FA not implemented')} type="button">Enable 2FA</button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="panel-card">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Security</p>
                    <h2>Change password</h2>
                  </div>
                </div>
                <form className="editor-card" onSubmit={handlePasswordSubmit}>
                  <div className="editor-grid">
                    <label>
                      Current password
                      <input onChange={(event) => updatePasswordField('current_password', event.target.value)} required type="password" value={passwordForm.current_password} />
                    </label>
                    <label>
                      New password
                      <input minLength={8} onChange={(event) => updatePasswordField('new_password', event.target.value)} required type="password" value={passwordForm.new_password} />
                    </label>
                    <label>
                      Confirm password
                      <input minLength={8} onChange={(event) => updatePasswordField('confirm_password', event.target.value)} required type="password" value={passwordForm.confirm_password} />
                    </label>
                  </div>
                  <div className="editor-actions mt-4">
                    <button className="solid-button" disabled={passwordStatus === 'loading'} type="submit">{passwordStatus === 'loading' ? 'Updating...' : 'Change password'}</button>
                  </div>
                  {passwordMessage ? <p className={passwordStatus === 'error' ? 'error-message' : 'success-message'}>{passwordMessage}</p> : null}
                </form>
              </section>

              <section className="panel-card">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Danger zone</p>
                    <h2>Account controls</h2>
                  </div>
                </div>
                <div className="form-section">
                  <div className="flex gap-3">
                    <button className="ghost-button" onClick={() => { if (confirm('Deactivate account?')) alert('Not implemented') }} type="button">Deactivate account</button>
                    <button className="solid-button" onClick={() => { if (confirm('Delete account permanently?')) alert('Not implemented') }} type="button">Delete account</button>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}
