export const ROLES = ['reporter', 'reviewer', 'admin'] as const
export type Role = (typeof ROLES)[number]

export type User = {
  id: string
  name: string
  role: Role
}

export type Session = {
  user: User
  idToken: string
  /** Epoch milliseconds. */
  expiresAt: number
}

export const ROLE_LABELS: Record<Role, string> = {
  reporter: 'Reporter',
  reviewer: 'Safety reviewer',
  admin: 'Administrator',
}

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}

/** Where each role lands after sign-in, and where it is sent when it tries a route it may not use. */
export function homePathFor(role: Role): string {
  return role === 'reporter' ? '/reporter' : '/review'
}
