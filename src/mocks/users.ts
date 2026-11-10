import type { User } from '@/auth/types'

/** The accounts the demo identity provider offers. */
export const users: readonly User[] = [
  { id: 'u-reporter-1', name: 'Dr Alex Morgan', role: 'reporter' },
  { id: 'u-reviewer-1', name: 'Jordan Lee', role: 'reviewer' },
  { id: 'u-reviewer-2', name: 'Chris Okafor', role: 'reviewer' },
  { id: 'u-admin-1', name: 'Sam Patel', role: 'admin' },
]

export function findUser(id: string): User | undefined {
  return users.find((user) => user.id === id)
}
