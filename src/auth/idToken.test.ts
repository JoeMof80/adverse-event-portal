import { CLIENT_ID, decodeIdToken, encodeIdToken, InvalidIdTokenError, ISSUER } from './idToken'

const now = Date.now()
const claims = {
  iss: ISSUER,
  aud: CLIENT_ID,
  sub: 'u-reviewer-1',
  name: 'Jordan Lee',
  role: 'reviewer',
  iat: Math.floor(now / 1000),
  exp: Math.floor(now / 1000) + 3600,
}

describe('ID token', () => {
  it('round-trips the user claims', () => {
    const token = encodeIdToken(claims)
    expect(token.split('.')).toHaveLength(3)
    const { user, expiresAt } = decodeIdToken(token, now)
    expect(user).toEqual({ id: 'u-reviewer-1', name: 'Jordan Lee', role: 'reviewer' })
    expect(expiresAt).toBe(claims.exp * 1000)
  })

  it('rejects a token for another audience', () => {
    const token = encodeIdToken({ ...claims, aud: 'another-app' })
    expect(() => decodeIdToken(token, now)).toThrow(InvalidIdTokenError)
    expect(() => decodeIdToken(token, now)).toThrow('unexpected audience')
  })

  it('rejects a token from another issuer', () => {
    const token = encodeIdToken({ ...claims, iss: 'https://evil.example' })
    expect(() => decodeIdToken(token, now)).toThrow('unexpected issuer')
  })

  it('rejects an expired token', () => {
    const token = encodeIdToken({ ...claims, exp: claims.iat - 1 })
    expect(() => decodeIdToken(token, now)).toThrow('expired')
  })

  it('rejects an unknown role', () => {
    const token = encodeIdToken({ ...claims, role: 'superuser' })
    expect(() => decodeIdToken(token, now)).toThrow('missing user claims')
  })

  it('rejects garbage', () => {
    expect(() => decodeIdToken('not-a-token', now)).toThrow('malformed')
  })
})
