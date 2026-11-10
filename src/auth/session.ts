import { isRole, type Session } from './types'

const SESSION_KEY = 'aep.session'

/** sessionStorage can be unavailable or throw (private mode, blocked storage), so every access is guarded. */
export function loadSession(now = Date.now()): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Session>
    if (
      !parsed.user ||
      typeof parsed.user.id !== 'string' ||
      typeof parsed.user.name !== 'string' ||
      !isRole(parsed.user.role) ||
      typeof parsed.idToken !== 'string' ||
      typeof parsed.expiresAt !== 'number' ||
      parsed.expiresAt <= now
    ) {
      return null
    }
    return { user: parsed.user, idToken: parsed.idToken, expiresAt: parsed.expiresAt }
  } catch {
    return null
  }
}

export function saveSession(session: Session): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // In-memory state still holds the session for this page load.
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Nothing to clear.
  }
}
