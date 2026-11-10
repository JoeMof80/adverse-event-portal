import type { ReactNode } from 'react'
import styles from './SummaryList.module.css'

export type SummaryRow = {
  label: string
  value: ReactNode
}

export type SummaryListProps = {
  rows: readonly SummaryRow[]
  /** Shown in place of an empty value. */
  emptyText?: string
}

/** Label and value pairs, for reviewing answers. */
export function SummaryList({ rows, emptyText = 'Not provided' }: SummaryListProps) {
  return (
    <dl className={styles.list}>
      {rows.map((row) => (
        <div key={row.label} className={styles.row}>
          <dt className={styles.label}>{row.label}</dt>
          <dd className={styles.value}>
            {row.value === undefined || row.value === null || row.value === '' ? (
              <span className={styles.empty}>{emptyText}</span>
            ) : (
              row.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
