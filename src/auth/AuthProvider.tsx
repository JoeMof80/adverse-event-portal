import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AuthContext } from './AuthContext'
import { clearSession, loadSession, saveSession } from './session'
import type { Session } from './types'

type AuthProviderProps = {
  children: ReactNode
  /** Seeds the session, for tests. Normally the session is read from sessionStorage. */
  initialSession?: Session | null
}

export function AuthProvider({ children, initialSession }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(() =>
    initialSession === undefined ? loadSession() : initialSession,
  )

  const signIn = useCallback((next: Session) => {
    saveSession(next)
    setSession(next)
  }, [])

  const signOut = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({ user: session?.user ?? null, signIn, signOut }),
    [session, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
