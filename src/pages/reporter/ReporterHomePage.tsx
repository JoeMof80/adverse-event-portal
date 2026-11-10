import { Link } from 'react-router'
import { useAuth } from '@/auth/AuthContext'

export function ReporterHomePage() {
  const { user } = useAuth()
  return (
    <>
      <h1>Report a suspected adverse event</h1>
      <p>Welcome, {user?.name}. Reports you start are saved as you go.</p>
      <p>
        <Link to="/reporter/new">Start a new report</Link>
      </p>
    </>
  )
}
