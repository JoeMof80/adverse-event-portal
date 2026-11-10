import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/auth/AuthContext'
import { Alert, Button } from '@/components'
import { clearDraft, loadDraft } from '@/features/report-form/draft'
import { REPORT_STEPS } from '@/features/report-form/steps'
import { formatDateTime } from '@/lib/formatDate'
import styles from './ReporterHomePage.module.css'

export function ReporterHomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const userId = user?.id ?? 'anonymous'
  const [draft, setDraft] = useState(() => loadDraft(userId))

  function startFresh() {
    clearDraft(userId)
    setDraft(null)
    void navigate('/reporter/new')
  }

  return (
    <>
      <h1>Report a suspected adverse event</h1>
      <p>
        Welcome, {user?.name}. Use this service to report a suspected side effect to a medicine.
        Your answers are saved as you go, so you can stop and come back later.
      </p>
      {draft ? (
        <Alert variant="info" title="You have a report in progress">
          <p>
            Last saved {formatDateTime(draft.updatedAt)}, on the step{' '}
            <strong>{REPORT_STEPS[Math.min(draft.stepIndex, REPORT_STEPS.length - 1)]}</strong>.
          </p>
          <div className={styles.actions}>
            <Link to="/reporter/new" className={styles.primaryLink}>
              Continue your report
            </Link>
            <Button variant="secondary" onClick={startFresh}>
              Start a new report instead
            </Button>
          </div>
        </Alert>
      ) : (
        <p>
          <Link to="/reporter/new" className={styles.primaryLink}>
            Start a new report
          </Link>
        </p>
      )}
      <p>
        <Link to="/reporter/reports">View your submitted reports</Link>
      </p>
    </>
  )
}
