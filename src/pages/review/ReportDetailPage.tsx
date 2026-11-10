import { useParams } from 'react-router'

export function ReportDetailPage() {
  const { reportId } = useParams()
  return (
    <>
      <h1>Report {reportId}</h1>
      <p>Report detail, status actions and audit history are built in Phase 6.</p>
    </>
  )
}
