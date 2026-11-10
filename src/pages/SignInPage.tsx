import { useLocation, useNavigate } from 'react-router'
import { beginSignIn } from '@/auth/oidc'
import { useAuth } from '@/auth/AuthContext'
import { homePathFor } from '@/auth/types'
import { Alert, Button, PageLayout } from '@/components'

type SignInLocationState = { returnTo?: string; error?: string } | null

export function SignInPage() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as SignInLocationState
  const returnTo = state?.returnTo ?? (user ? homePathFor(user.role) : '/')

  function handleSignIn() {
    void navigate(beginSignIn(returnTo))
  }

  return (
    <PageLayout>
      <h1>Sign in</h1>
      {state?.error && (
        <Alert variant="error" title="Sign-in failed">
          <p>{state.error}</p>
        </Alert>
      )}
      <p>Use your organisation's single sign-on account to report or review adverse events.</p>
      <p>
        <Button onClick={handleSignIn}>Sign in with single sign-on</Button>
      </p>
    </PageLayout>
  )
}
