import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { apiFetch } from '@/api/client'
import { ROLE_LABELS, type User } from '@/auth/types'
import { Alert, Button, PageLayout } from '@/components'
import styles from './AuthorisePage.module.css'
import { usePageTitle } from '@/lib/usePageTitle'

/**
 * Stands in for the identity provider's sign-in page. In production this page belongs to
 * PingFederate; the app never renders it. Here it lets the demo pick an account.
 */
export function AuthorisePage() {
  usePageTitle('Choose an account')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<readonly User[]>([])
  const [error, setError] = useState<string | null>(null)

  const redirectUri = searchParams.get('redirect_uri')
  const state = searchParams.get('state')

  useEffect(() => {
    apiFetch<User[]>('/api/oidc/accounts')
      .then(setAccounts)
      .catch(() => setError('The demo accounts could not be loaded.'))
  }, [])

  async function chooseAccount(user: User) {
    if (!redirectUri || !state) return
    try {
      const { code } = await apiFetch<{ code: string }>('/api/oidc/authorize', {
        method: 'POST',
        body: { sub: user.id },
      })
      const params = new URLSearchParams({ code, state })
      void navigate(`${redirectUri}?${params.toString()}`, { replace: true })
    } catch {
      setError('The identity provider could not issue a sign-in code.')
    }
  }

  const requestIsValid = Boolean(redirectUri && state)

  return (
    <PageLayout>
      <div className={styles.idp}>
        <p className={styles.badge}>Demo identity provider</p>
        <h1>Choose an account</h1>
        <p>
          This page stands in for the organisation's PingFederate sign-in. Pick an account to
          continue to the portal as that user.
        </p>
        {!requestIsValid && (
          <Alert variant="error" title="Invalid sign-in request">
            <p>
              The request is missing its redirect URI or state. Start again from the sign-in page.
            </p>
          </Alert>
        )}
        {error && (
          <Alert variant="error" title="Something went wrong">
            <p>{error}</p>
          </Alert>
        )}
        <ul className={styles.accounts}>
          {accounts.map((account) => (
            <li key={account.id}>
              <Button
                variant="secondary"
                onClick={() => void chooseAccount(account)}
                disabled={!requestIsValid}
                className={styles.account}
              >
                <span className={styles.accountName}>{account.name}</span>
                <span className={styles.accountRole}>{ROLE_LABELS[account.role]}</span>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </PageLayout>
  )
}
