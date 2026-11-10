import type { ReactNode } from 'react'
import styles from './PageLayout.module.css'

export type PageLayoutProps = {
  /** Site navigation, rendered in the header. */
  nav?: ReactNode
  children: ReactNode
}

export function PageLayout({ nav, children }: PageLayoutProps) {
  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.brand}>Adverse Event Reporting Portal</span>
          {nav}
        </div>
      </header>
      <main id="main-content" className={styles.main} tabIndex={-1}>
        {children}
      </main>
    </>
  )
}
