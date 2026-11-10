import { Link } from 'react-router'
import { useReports } from '@/api/reports'
import { Alert, StatusTag } from '@/components'
import { formatDate } from '@/lib/formatDate'
import styles from './MyReportsPage.module.css'

export function MyReportsPage() {
  const reports = useReports()

  return (
    <>
      <h1>My reports</h1>
      {reports.isPending && <p role="status">Loading your reports.</p>}
      {reports.isError && (
        <Alert variant="error" title="Your reports could not be loaded">
          <p>{reports.error.message}</p>
        </Alert>
      )}
      {reports.isSuccess && reports.data.length === 0 && (
        <p>
          You have not submitted any reports yet. <Link to="/reporter/new">Start a new report</Link>
          .
        </p>
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
    </>
  )
}
