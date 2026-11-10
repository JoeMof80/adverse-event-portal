import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/auth/AuthContext'
import { homePathFor, type Role } from '@/auth/types'

/** Sends signed-out users to the sign-in page, remembering where they were going. */
export function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) {
    const returnTo = `${location.pathname}${location.search}`
    return <Navigate to="/sign-in" replace state={{ returnTo }} />
  }
  return <Outlet />
}

type RequireRoleProps = {
  roles: readonly Role[]
}

/** Sends users without one of the given roles to their own home page. Use inside RequireAuth. */
export function RequireRole({ roles }: RequireRoleProps) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/sign-in" replace />
  }
  if (!roles.includes(user.role)) {
    return <Navigate to={homePathFor(user.role)} replace />
  }
  return <Outlet />
}
