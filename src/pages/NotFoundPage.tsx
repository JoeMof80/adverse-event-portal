import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <>
      <h1>Page not found</h1>
      <p>
        The page you asked for does not exist. <Link to="/">Go to your home page</Link>.
      </p>
    </>
  )
}
