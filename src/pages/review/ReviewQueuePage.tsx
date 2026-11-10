import { Link, useSearchParams } from 'react-router'
import { useReports } from '@/api/reports'
import { Alert, CheckboxGroup, Field, Select, StatusTag } from '@/components'
import {
  isReportStatus,
  REPORT_STATUS_LABELS,
  REPORT_STATUSES,
  type ReportStatus,
} from '@/domain/report'
import { formatDate } from '@/lib/formatDate'
import styles from './ReviewQueuePage.module.css'

const DEFAULT_STATUSES: readonly ReportStatus[] = ['submitted', 'under-review']

const statusOptions = REPORT_STATUSES.map((value) => ({
  value,
  label: REPORT_STATUS_LABELS[value],
}))

/** The reviewer's queue. Filter and sort live in the URL so a view can be shared or refreshed. */
export function ReviewQueuePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusParams = searchParams.getAll('status').filter(isReportStatus)
  const statuses = searchParams.has('status') ? statusParams : DEFAULT_STATUSES
  const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc'

  const reports = useReports({ status: statuses, order })

  function setStatuses(next: readonly ReportStatus[]) {
    const params = new URLSearchParams(searchParams)
    params.delete('status')
    // An explicit empty selection is kept as "status=" so it is not mistaken for the default.
    if (next.length === 0) params.set('status', '')
    for (const status of next) params.append('status', status)
    setSearchParams(params, { replace: true })
  }

  function setOrder(next: string) {
    const params = new URLSearchParams(searchParams)
    params.set('order', next)
    setSearchParams(params, { replace: true })
  }

  return (
    <>
      <h1>Review queue</h1>
      <div className={styles.filters} role="group" aria-label="Filter and sort">
        <CheckboxGroup
          id="filter-status"
          legend="Status"
          hint="Untick every status to show all reports"
          options={statusOptions}
          inline
          optional
          name="status"
          value={statuses}
          onChange={(event) => {
            const value = event.target.value as ReportStatus
            setStatuses(
              event.target.checked
                ? [...statuses, value]
                : statuses.filter((status) => status !== value),
            )
          }}
        />
        <Field id="sort-order" label="Sort by">
          <Select
            options={[
              { value: 'desc', label: 'Newest submitted first' },
              { value: 'asc', label: 'Oldest submitted first' },
            ]}
            value={order}
            onChange={(event) => setOrder(event.target.value)}
          />
        </Field>
      </div>

      {reports.isPending && <p role="status">Loading reports.</p>}
      {reports.isError && (
        <Alert variant="error" title="The queue could not be loaded">
          <p>{reports.error.message}</p>
        </Alert>
      )}
      {reports.isSuccess && (
        <p role="status" className={styles.count}>
          Showing {reports.data.length} {reports.data.length === 1 ? 'report' : 'reports'}
        </p>
      )}
      {reports.isSuccess && reports.data.length > 0 && (
        <table className={styles.table}>
          <caption className="visually-hidden">Reports matching the current filters</caption>
          <thead>
            <tr>
              <th scope="col">Reference</th>
              <th scope="col">Submitted</th>
              <th scope="col">Patient</th>
              <th scope="col">Medicine</th>
              <th scope="col">Serious</th>
              <th scope="col">Reporter</th>
              <th scope="col">Assigned to</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.data.map((report) => (
              <tr key={report.id}>
                <th scope="row">
                  <Link to={`/review/${report.id}`}>{report.id}</Link>
                </th>
                <td>{formatDate(report.submittedAt)}</td>
                <td>{report.patientInitials}</td>
                <td>{report.medicineName}</td>
                <td>{report.serious ? <strong>Yes</strong> : 'No'}</td>
                <td>{report.reporterName}</td>
                <td>
                  {report.assignedReviewerName ?? <span className={styles.muted}>Unassigned</span>}
                </td>
                <td>
                  <StatusTag status={report.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
