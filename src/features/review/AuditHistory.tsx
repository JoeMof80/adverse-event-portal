import { useReportAudit } from '@/api/reports'
import { ROLE_LABELS } from '@/auth/types'
import { Alert } from '@/components'
import {
  AUDIT_ACTION_LABELS,
  isReportStatus,
  REPORT_STATUS_LABELS,
  type AuditEvent,
} from '@/domain/report'
import { formatDateTime } from '@/lib/formatDate'
import styles from './AuditHistory.module.css'

type AuditHistoryProps = {
  reportId: string
}

function describe(event: AuditEvent): string | null {
  switch (event.action) {
    case 'status-changed':
      return `${labelStatus(event.before)} to ${labelStatus(event.after)}`
    case 'reassigned':
      return `${event.before ?? 'Unassigned'} to ${event.after ?? 'Unassigned'}`
    case 'note-added':
      return event.detail ?? null
    default:
      return null
  }
}

function labelStatus(value: string | undefined): string {
  return isReportStatus(value) ? REPORT_STATUS_LABELS[value] : (value ?? 'Unknown')
}

/** Every recorded action on the report, newest first. */
export function AuditHistory({ reportId }: AuditHistoryProps) {
  const audit = useReportAudit(reportId)

  return (
    <section aria-labelledby="audit-heading" className={styles.audit}>
      <h2 id="audit-heading">History</h2>
      {audit.isPending && <p role="status">Loading history.</p>}
      {audit.isError && (
        <Alert variant="error" title="The history could not be loaded">
          <p>{audit.error.message}</p>
        </Alert>
      )}
      {audit.isSuccess && (
        <ol className={styles.list}>
          {audit.data.map((event) => {
            const detail = describe(event)
            return (
              <li key={event.id} className={styles.event}>
                <p className={styles.action}>{AUDIT_ACTION_LABELS[event.action]}</p>
                {detail && <p className={styles.detail}>{detail}</p>}
                <p className={styles.meta}>
                  {event.actorName} ({ROLE_LABELS[event.actorRole]}),{' '}
                  <time dateTime={event.at}>{formatDateTime(event.at)}</time>
                </p>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
