import { Navigate } from 'react-router'
import { useAuth } from '@/auth/AuthContext'
import { homePathFor } from '@/auth/types'

export function HomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? homePathFor(user.role) : '/sign-in'} replace />
}
