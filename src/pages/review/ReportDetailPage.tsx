import { Link, useParams } from 'react-router'
import { useReport } from '@/api/reports'
import { Alert, StatusTag, SummaryList } from '@/components'
import { AuditHistory } from '@/features/review/AuditHistory'
import { reportSections } from '@/features/review/reportRows'
import { ReviewActions } from '@/features/review/ReviewActions'
import { ReviewNotes } from '@/features/review/ReviewNotes'
import { formatDateTime } from '@/lib/formatDate'
import styles from './ReportDetailPage.module.css'
import { usePageTitle } from '@/lib/usePageTitle'

export function ReportDetailPage() {
  const { reportId = '' } = useParams()
  const report = useReport(reportId)
  usePageTitle(`Report ${reportId}`)

  if (report.isPending) {
    return (
      <>
        <h1>Report {reportId}</h1>
        <p role="status">Loading report.</p>
      </>
    )
  }

  if (report.isError) {
    return (
      <>
        <h1>Report {reportId}</h1>
        <Alert variant="error" title="The report could not be loaded">
          <p>{report.error.message}</p>
          <p>
            <Link to="/review">Back to the review queue</Link>
          </p>
        </Alert>
      </>
    )
  }

  const data = report.data

  return (
    <>
      <p>
        <Link to="/review">Back to the review queue</Link>
      </p>
      <div className={styles.header}>
        <h1>Report {data.id}</h1>
        <StatusTag status={data.status} />
      </div>
      <SummaryList
        rows={[
          { label: 'Submitted', value: formatDateTime(data.submittedAt) },
          { label: 'Reporter', value: data.reporterName },
          { label: 'Assigned to', value: data.assignedReviewerName ?? 'Unassigned' },
          { label: 'Last updated', value: formatDateTime(data.updatedAt) },
        ]}
      />

      <div className={styles.layout}>
        {/* Actions come first in reading and tab order; the grid places them alongside. */}
        <aside className={styles.side}>
          <ReviewActions report={data} />
          <AuditHistory reportId={data.id} />
        </aside>
        <div className={styles.main}>
          {reportSections(data).map((section) => (
            <section key={section.title} className={styles.section}>
              <h2>{section.title}</h2>
              <SummaryList rows={section.rows} />
            </section>
          ))}
          <ReviewNotes report={data} />
        </div>
      </div>
    </>
  )
}
