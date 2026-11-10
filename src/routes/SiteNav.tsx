import { NavLink, useNavigate } from 'react-router'
import { useAuth } from '@/auth/AuthContext'
import { ROLE_LABELS, type Role } from '@/auth/types'
import { Button } from '@/components'
import styles from './SiteNav.module.css'

type NavItem = { to: string; label: string; roles: readonly Role[] }

const NAV_ITEMS: readonly NavItem[] = [
  { to: '/reporter', label: 'Home', roles: ['reporter'] },
  { to: '/reporter/new', label: 'New report', roles: ['reporter'] },
  { to: '/reporter/reports', label: 'My reports', roles: ['reporter'] },
  { to: '/review', label: 'Review queue', roles: ['reviewer', 'admin'] },
]

export function SiteNav() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  if (!user) return null

  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role))

  function handleSignOut() {
    signOut()
    void navigate('/sign-in', { replace: true })
  }

  return (
    <nav aria-label="Main" className={styles.nav}>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end
              className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <p className={styles.user}>
        <span className="visually-hidden">Signed in as </span>
        <span className={styles.userName}>{user.name}</span>
        <span className={styles.userRole}> ({ROLE_LABELS[user.role]})</span>
      </p>
      <Button variant="secondary" onClick={handleSignOut} className={styles.signOut}>
        Sign out
      </Button>
    </nav>
  )
}
