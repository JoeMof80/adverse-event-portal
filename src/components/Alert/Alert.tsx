import type { ReactNode, Ref } from 'react'
import { cx } from '@/lib/cx'
import styles from './Alert.module.css'

export type AlertVariant = 'info' | 'success' | 'error'

export type AlertProps = {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  /** Alerts are focusable so a page can move focus to them after an action. */
  ref?: Ref<HTMLDivElement>
}

export function Alert({ variant = 'info', title, children, ref }: AlertProps) {
  return (
    <div
      ref={ref}
      role={variant === 'error' ? 'alert' : 'status'}
      tabIndex={-1}
      className={cx(styles.alert, styles[variant])}
    >
      {title && <p className={styles.title}>{title}</p>}
      <div className={styles.body}>{children}</div>
    </div>
  )
}
