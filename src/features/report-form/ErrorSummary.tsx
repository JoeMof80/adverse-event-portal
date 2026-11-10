import type { Ref } from 'react'
import { Alert } from '@/components'
import styles from './ErrorSummary.module.css'

export type ErrorSummaryItem = {
  /** The id of the control to focus when the link is followed. */
  focusId: string
  message: string
}

type ErrorSummaryProps = {
  items: readonly ErrorSummaryItem[]
  ref?: Ref<HTMLDivElement>
}

/** Lists every error on the step, each linking to its field. Focused when a step fails to validate. */
export function ErrorSummary({ items, ref }: ErrorSummaryProps) {
  if (items.length === 0) return null
  return (
    <Alert ref={ref} variant="error" title="There is a problem">
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.focusId}>
            <a
              href={`#${item.focusId}`}
              className={styles.link}
              onClick={(event) => {
                event.preventDefault()
                document.getElementById(item.focusId)?.focus()
              }}
            >
              {item.message}
            </a>
          </li>
        ))}
      </ul>
    </Alert>
  )
}
