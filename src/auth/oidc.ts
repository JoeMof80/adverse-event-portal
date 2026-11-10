import { apiFetch } from '@/api/client'
import { CLIENT_ID, decodeIdToken } from './idToken'
import type { Session } from './types'

/**
 * Client side of an OIDC authorization code flow, shaped like a PingFederate integration.
 *
 * Real integration: AUTHORIZE_PATH would be PingFederate's /as/authorization.oauth2 on the
 * identity provider's host and the token exchange would hit /as/token.oauth2 (via a backend or
 * PKCE). Here the authorise page is a route in this app and the token endpoint is mocked.
 */
export const AUTHORIZE_PATH = '/idp/authorise'
export const CALLBACK_PATH = '/auth/callback'

const PENDING_KEY = 'aep.oidc.pending'

type PendingSignIn = { state: string; returnTo: string }

function randomState(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Starts sign-in. Returns the authorise URL to navigate to. */
export function beginSignIn(returnTo: string): string {
  const pending: PendingSignIn = { state: randomState(), returnTo }
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending))
  } catch {
    // Without storage the state check will fail and the user is asked to try again.
  }
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    scope: 'openid profile',
    redirect_uri: CALLBACK_PATH,
    state: pending.state,
  })
  return `${AUTHORIZE_PATH}?${params.toString()}`
}

function takePendingSignIn(): PendingSignIn | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY)
    sessionStorage.removeItem(PENDING_KEY)
    return raw ? (JSON.parse(raw) as PendingSignIn) : null
  } catch {
    return null
  }
}

export class SignInError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SignInError'
  }
}

type TokenResponse = {
  id_token: string
  access_token: string
  token_type: string
  expires_in: number
}

/** Completes sign-in from the callback URL. Returns the session and where to go next. */
export async function completeSignIn(
  search: URLSearchParams,
): Promise<{ session: Session; returnTo: string }> {
  const code = search.get('code')
  const state = search.get('state')
  const pending = takePendingSignIn()

  if (!code || !state) {
    throw new SignInError('The sign-in response was missing its code or state.')
  }
  if (!pending || pending.state !== state) {
    throw new SignInError('The sign-in response did not match this browser session.')
  }

  const tokens = await apiFetch<TokenResponse>('/api/oidc/token', {
    method: 'POST',
    body: {
      grant_type: 'authorization_code',
      code,
      redirect_uri: CALLBACK_PATH,
      client_id: CLIENT_ID,
    },
  })
  const { user, expiresAt } = decodeIdToken(tokens.id_token)
  return { session: { user, idToken: tokens.id_token, expiresAt }, returnTo: pending.returnTo }
}
