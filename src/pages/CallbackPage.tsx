import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '@/auth/AuthContext'
import { completeSignIn } from '@/auth/oidc'
import { PageLayout } from '@/components'

/** The redirect URI the identity provider returns to. Exchanges the code and starts the session. */
export function CallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const started = useRef(false)

  useEffect(() => {
    // React Strict Mode runs effects twice; the code is single-use, so guard the exchange.
    if (started.current) return
    started.current = true

    completeSignIn(searchParams)
      .then(({ session, returnTo }) => {
        signIn(session)
        void navigate(returnTo, { replace: true })
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Sign-in could not be completed.'
        void navigate('/sign-in', { replace: true, state: { error: message } })
      })
  }, [searchParams, signIn, navigate])

  return (
    <PageLayout>
      <h1>Signing you in</h1>
      <p role="status">Completing sign-in, please wait.</p>
    </PageLayout>
  )
}
