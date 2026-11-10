import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useReports } from '@/api/reports'
import { useAuth } from '@/auth/AuthContext'
import { Alert, Button, StatusTag } from '@/components'
import { clearDraft, loadDraft } from '@/features/report-form/draft'
import { REPORT_STEPS } from '@/features/report-form/steps'
import { formatDate, formatDateTime } from '@/lib/formatDate'
import { usePageTitle } from '@/lib/usePageTitle'
import styles from './ReporterHomePage.module.css'

/** The reporter's one page: continue or start a report, and see what happened to earlier ones. */
export function ReporterHomePage() {
  usePageTitle('Your reports')
  const { user } = useAuth()
  const navigate = useNavigate()
  const userId = user?.id ?? 'anonymous'
  const [draft, setDraft] = useState(() => loadDraft(userId))
  const reports = useReports()

  function startFresh() {
    clearDraft(userId)
    setDraft(null)
    void navigate('/reporter/new')
  }

  return (
    <>
      <h1>Your reports</h1>
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

      <section aria-labelledby="submitted-heading" className={styles.submitted}>
        <h2 id="submitted-heading">Submitted reports</h2>
        {reports.isPending && <p role="status">Loading your reports.</p>}
        {reports.isError && (
          <Alert variant="error" title="Your reports could not be loaded">
            <p>{reports.error.message}</p>
          </Alert>
        )}
        {reports.isSuccess && reports.data.length === 0 && (
          <p>You have not submitted any reports yet.</p>
        )}
        {reports.isSuccess && reports.data.length > 0 && (
          <table className={styles.table}>
            <caption className="visually-hidden">Your submitted reports</caption>
            <thead>
              <tr>
                <th scope="col">Reference</th>
                <th scope="col">Patient</th>
                <th scope="col">Medicine</th>
                <th scope="col">Submitted</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.data.map((report) => (
                <tr key={report.id}>
                  <th scope="row">{report.id}</th>
                  <td>{report.patientInitials}</td>
                  <td>{report.medicineName}</td>
                  <td>{formatDate(report.submittedAt)}</td>
                  <td>
                    <StatusTag status={report.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  )
}
