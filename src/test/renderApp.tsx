import { render } from '@testing-library/react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { AuthProvider } from '@/auth/AuthProvider'
import type { Role, Session, User } from '@/auth/types'
import { routes } from '@/routes/routes'

const TEST_USERS: Record<Role, User> = {
  reporter: { id: 'u-reporter-1', name: 'Dr Alex Morgan', role: 'reporter' },
  reviewer: { id: 'u-reviewer-1', name: 'Jordan Lee', role: 'reviewer' },
  admin: { id: 'u-admin-1', name: 'Sam Patel', role: 'admin' },
}

export function makeSession(role: Role): Session {
  return {
    user: TEST_USERS[role],
    idToken: 'test-token',
    expiresAt: Date.now() + 60 * 60 * 1000,
  }
}

/** Renders the real route tree at a path, optionally signed in as a role. */
export function renderApp(initialPath: string, options: { as?: Role } = {}) {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] })
  const session = options.as ? makeSession(options.as) : null
  const result = render(
    <AuthProvider initialSession={session}>
      <RouterProvider router={router} />
    </AuthProvider>,
  )
  return { ...result, router }
}
