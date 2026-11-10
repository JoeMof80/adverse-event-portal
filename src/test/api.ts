import { CLIENT_ID, encodeIdToken, ISSUER } from '@/auth/idToken'
import type { User } from '@/auth/types'
import { findUser } from '@/mocks/users'

/** A valid ID token for one of the demo accounts, for calling the mock API directly in tests. */
export function tokenFor(userId: string): string {
  const user: User | undefined = findUser(userId)
  if (!user) throw new Error(`No demo user ${userId}`)
  const now = Math.floor(Date.now() / 1000)
  return encodeIdToken({
    iss: ISSUER,
    aud: CLIENT_ID,
    sub: user.id,
    name: user.name,
    role: user.role,
    iat: now,
    exp: now + 3600,
  })
}

type CallOptions = { as?: string; method?: string; body?: unknown }

/** Calls the mock API the way the app does, returning status and parsed JSON. */
export async function call<T = unknown>(
  path: string,
  { as, method = 'GET', body }: CallOptions = {},
): Promise<{ status: number; data: T }> {
  const response = await fetch(new URL(path, window.location.origin), {
    method,
    headers: {
      Accept: 'application/json',
      ...(as ? { Authorization: `Bearer ${tokenFor(as)}` } : {}),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = (await response.json()) as T
  return { status: response.status, data }
}
