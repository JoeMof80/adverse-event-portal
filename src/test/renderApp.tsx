import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { StrictMode } from 'react'
import { createQueryClient } from '@/api/queryClient'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { AuthProvider } from '@/auth/AuthProvider'
import { saveSession } from '@/auth/session'
import type { Role, Session, User } from '@/auth/types'
import { routes } from '@/routes/routes'
import { tokenFor } from './api'

const TEST_USERS: Record<Role, User> = {
  reporter: { id: 'u-reporter-1', name: 'Dr Alex Morgan', role: 'reporter' },
  reviewer: { id: 'u-reviewer-1', name: 'Jordan Lee', role: 'reviewer' },
  admin: { id: 'u-admin-1', name: 'Sam Patel', role: 'admin' },
}

export function makeSession(role: Role): Session {
  const user = TEST_USERS[role]
  return {
    user,
    idToken: tokenFor(user.id),
    expiresAt: Date.now() + 60 * 60 * 1000,
  }
}

/** Renders the real route tree at a path, optionally signed in as a role. */
export function renderApp(initialPath: string, options: { as?: Role } = {}) {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] })
  const session = options.as ? makeSession(options.as) : null
  // The API reads the token from sessionStorage, so a signed-in test must persist it too.
  if (session) saveSession(session)
  const queryClient = createQueryClient({ retry: false })
  // Strict Mode, as in development, so double-run effects and renders are exercised by tests.
  const result = render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider initialSession={session}>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
  return { ...result, router, queryClient }
}
