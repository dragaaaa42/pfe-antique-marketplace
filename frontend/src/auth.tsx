import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  applyAccessToken,
  clearAuthSession,
  getCurrentUser,
  loadAuthSession,
  loginUser,
  refreshAccessToken,
  saveAuthSession,
  type AuthSession,
  type AuthUser,
  type LoginPayload,
} from './api'

type AuthStatus = 'loading' | 'anonymous' | 'authenticated'

type AuthContextValue = {
  status: AuthStatus
  user: AuthUser | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<AuthSession>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const session = loadAuthSession()

    if (!session) {
      applyAccessToken(null)
      setStatus('anonymous')
      return
    }

    let cancelled = false

    const restoreSession = async () => {
      applyAccessToken(session.access)
      setUser(session.user)
      setStatus('authenticated')

      try {
        const currentUser = await getCurrentUser()
        if (cancelled) return

        const nextSession: AuthSession = {
          ...session,
          user: currentUser,
        }

        saveAuthSession(nextSession)
        setUser(currentUser)
      } catch {
        try {
          const refreshed = await refreshAccessToken(session.refresh)
          applyAccessToken(refreshed.access)
          const currentUser = await getCurrentUser()

          if (cancelled) return

          const nextSession: AuthSession = {
            access: refreshed.access,
            refresh: session.refresh,
            user: currentUser,
          }

          saveAuthSession(nextSession)
          setUser(currentUser)
        } catch {
          if (cancelled) return

          clearAuthSession()
          applyAccessToken(null)
          setUser(null)
          setStatus('anonymous')
        }
      }
    }

    void restoreSession()

    return () => {
      cancelled = true
    }
  }, [])

  async function login(payload: LoginPayload) {
    const session = await loginUser(payload)
    saveAuthSession(session)
    setUser(session.user)
    setStatus('authenticated')
    return session
  }

  function logout() {
    clearAuthSession()
    applyAccessToken(null)
    setUser(null)
    setStatus('anonymous')
  }

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        isAuthenticated: status === 'authenticated' && Boolean(user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
