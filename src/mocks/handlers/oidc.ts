import { http, HttpResponse } from 'msw'
import { CLIENT_ID, encodeIdToken, ISSUER } from '@/auth/idToken'
import { findUser, users } from '@/mocks/users'

/**
 * The identity provider's side of the authorization code flow. Stands in for PingFederate's
 * authorization and token endpoints.
 */

const TOKEN_LIFETIME_SECONDS = 60 * 60

/** Issued codes, each redeemable once. */
const issuedCodes = new Map<string, string>()

export const oidcHandlers = [
  http.get('/api/oidc/accounts', () => HttpResponse.json(users)),

  http.post('/api/oidc/authorize', async ({ request }) => {
    const body = (await request.json()) as { sub?: string }
    const user = body.sub ? findUser(body.sub) : undefined
    if (!user) {
      return HttpResponse.json({ message: 'Unknown account' }, { status: 400 })
    }
    const code = `code-${crypto.randomUUID()}`
    issuedCodes.set(code, user.id)
    return HttpResponse.json({ code })
  }),

  http.post('/api/oidc/token', async ({ request }) => {
    const body = (await request.json()) as {
      grant_type?: string
      code?: string
      client_id?: string
    }
    if (body.grant_type !== 'authorization_code' || body.client_id !== CLIENT_ID) {
      return HttpResponse.json({ error: 'invalid_request' }, { status: 400 })
    }
    const sub = body.code ? issuedCodes.get(body.code) : undefined
    if (!sub) {
      return HttpResponse.json({ error: 'invalid_grant' }, { status: 400 })
    }
    issuedCodes.delete(body.code!)
    const user = findUser(sub)!
    const now = Math.floor(Date.now() / 1000)
    const id_token = encodeIdToken({
      iss: ISSUER,
      aud: CLIENT_ID,
      sub: user.id,
      name: user.name,
      role: user.role,
      iat: now,
      exp: now + TOKEN_LIFETIME_SECONDS,
    })
    return HttpResponse.json({
      id_token,
      access_token: `access-${crypto.randomUUID()}`,
      token_type: 'Bearer',
      expires_in: TOKEN_LIFETIME_SECONDS,
    })
  }),
]
