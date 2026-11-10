import { isRole, type User } from './types'

/**
 * A stand-in for the OIDC ID token PingFederate would issue. It has the shape of a JWT
 * (header.payload.signature) so the client decodes it the way it would a real one, but the
 * signature is a fixed string: nothing here verifies it, and nothing should rely on it.
 */

export const ISSUER = 'https://pingfederate.example.test/idp'
export const CLIENT_ID = 'adverse-event-portal'

export type IdTokenClaims = {
  iss: string
  aud: string
  sub: string
  name: string
  role: string
  iat: number
  exp: number
}

function base64UrlEncode(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(value: string): string {
  const padded = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=')
  return atob(padded)
}

export function encodeIdToken(claims: IdTokenClaims): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const payload = base64UrlEncode(JSON.stringify(claims))
  return `${header}.${payload}.stub-signature`
}

export class InvalidIdTokenError extends Error {
  constructor(reason: string) {
    super(`Invalid ID token: ${reason}`)
    this.name = 'InvalidIdTokenError'
  }
}

/** Decodes the token and checks issuer, audience and expiry. Returns the user it describes. */
export function decodeIdToken(token: string, now = Date.now()): { user: User; expiresAt: number } {
  const parts = token.split('.')
  if (parts.length !== 3 || !parts[1]) {
    throw new InvalidIdTokenError('malformed')
  }
  let claims: Partial<IdTokenClaims>
  try {
    claims = JSON.parse(base64UrlDecode(parts[1])) as Partial<IdTokenClaims>
  } catch {
    throw new InvalidIdTokenError('payload is not JSON')
  }
  if (claims.iss !== ISSUER) throw new InvalidIdTokenError('unexpected issuer')
  if (claims.aud !== CLIENT_ID) throw new InvalidIdTokenError('unexpected audience')
  if (typeof claims.exp !== 'number' || claims.exp * 1000 <= now) {
    throw new InvalidIdTokenError('expired')
  }
  if (typeof claims.sub !== 'string' || typeof claims.name !== 'string' || !isRole(claims.role)) {
    throw new InvalidIdTokenError('missing user claims')
  }
  return {
    user: { id: claims.sub, name: claims.name, role: claims.role },
    expiresAt: claims.exp * 1000,
  }
}
