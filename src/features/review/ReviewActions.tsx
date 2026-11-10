import { useState } from 'react'
import { useChangeReportStatus, useReassignReport, useReviewers } from '@/api/reports'
import { useAuth } from '@/auth/AuthContext'
import { Alert, Button, Field, Select } from '@/components'
import {
  REPORT_STATUS_LABELS,
  STATUS_TRANSITIONS,
  type Report,
  type ReportStatus,
} from '@/domain/report'
import styles from './ReviewActions.module.css'

const ACTION_LABELS: Record<ReportStatus, string> = {
  submitted: 'Reopen',
  'under-review': 'Start review',
  closed: 'Close report',
}

type ReviewActionsProps = {
  report: Report
}

/** Status changes for reviewers and admins, and reassignment for admins. */
export function ReviewActions({ report }: ReviewActionsProps) {
  const { user } = useAuth()
  const changeStatus = useChangeReportStatus(report.id)
  const reassign = useReassignReport(report.id)
  const canReview = user?.role === 'reviewer' || user?.role === 'admin'
  const canReassign = user?.role === 'admin'
  const reviewers = useReviewers()
  const [reviewerId, setReviewerId] = useState('')

  if (!canReview) return null

  const transitions = STATUS_TRANSITIONS[report.status]

  return (
    <section aria-labelledby="actions-heading" className={styles.panel}>
      <h2 id="actions-heading">Actions</h2>

      {changeStatus.isSuccess && (
        <Alert variant="success">
          <p>Status changed to {REPORT_STATUS_LABELS[changeStatus.data.status]}.</p>
        </Alert>
      )}
      {changeStatus.isError && (
        <Alert variant="error" title="The status could not be changed">
          <p>{changeStatus.error.message}</p>
        </Alert>
      )}

      {transitions.length > 0 ? (
        <div className={styles.buttons}>
          {transitions.map((next) => (
            <Button
              key={next}
              onClick={() => changeStatus.mutate(next)}
              disabled={changeStatus.isPending}
              variant={next === 'closed' ? 'secondary' : 'primary'}
            >
              {ACTION_LABELS[next]}
            </Button>
          ))}
        </div>
      ) : (
        <p>This report is closed. No further status changes are possible.</p>
      )}

      {canReassign && (
        <form
          className={styles.reassign}
          onSubmit={(event) => {
            event.preventDefault()
            if (reviewerId) reassign.mutate(reviewerId)
          }}
        >
          <h3>Reassign</h3>
          {reassign.isSuccess && (
            <Alert variant="success">
              <p>Reassigned to {reassign.data.assignedReviewerName}.</p>
            </Alert>
          )}
          {reassign.isError && (
            <Alert variant="error" title="The report could not be reassigned">
              <p>{reassign.error.message}</p>
            </Alert>
          )}
          <Field id="reassign-reviewer" label="Assign to">
            <Select
              options={(reviewers.data ?? [])
                .filter((reviewer) => reviewer.id !== report.assignedReviewerId)
                .map((reviewer) => ({ value: reviewer.id, label: reviewer.name }))}
              placeholder="Choose a reviewer"
              value={reviewerId}
              onChange={(event) => setReviewerId(event.target.value)}
            />
          </Field>
          <Button type="submit" variant="secondary" disabled={!reviewerId || reassign.isPending}>
            Reassign report
          </Button>
        </form>
      )}
    </section>
  )
}
