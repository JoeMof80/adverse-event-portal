import { HttpResponse } from 'msw'
import { decodeIdToken } from '@/auth/idToken'
import type { Role, User } from '@/auth/types'

/**
 * Reads the bearer token the client sends and resolves the user it identifies, or returns the
 * 401 response to send instead. Callers check with `instanceof Response`.
 */
export function authenticate(request: Request): User | Response {
  const header = request.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null
  if (!token) {
    return HttpResponse.json({ message: 'Sign in to continue' }, { status: 401 })
  }
  try {
    return decodeIdToken(token).user
  } catch {
    return HttpResponse.json({ message: 'Your session is no longer valid' }, { status: 401 })
  }
}

export function forbiddenUnless(user: User, roles: readonly Role[]): Response | null {
  return roles.includes(user.role)
    ? null
    : HttpResponse.json({ message: 'You do not have permission to do that' }, { status: 403 })
}

export const REVIEW_ROLES: readonly Role[] = ['reviewer', 'admin']
