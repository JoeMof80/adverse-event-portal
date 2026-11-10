import { cx } from '@/lib/cx'
import styles from './Stepper.module.css'

export type StepperProps = {
  steps: readonly string[]
  /** Zero-based index of the current step. Earlier steps are shown as completed. */
  currentIndex: number
}

export function Stepper({ steps, currentIndex }: StepperProps) {
  return (
    <nav aria-label="Progress" className={styles.stepper}>
      <p className={styles.summary}>
        Step {currentIndex + 1} of {steps.length}
      </p>
      <ol className={styles.list}>
        {steps.map((step, index) => {
          const isCurrent = index === currentIndex
          const isComplete = index < currentIndex
          return (
            <li
              key={step}
              className={cx(
                styles.step,
                isCurrent && styles.current,
                isComplete && styles.complete,
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className={styles.marker} aria-hidden="true">
                {isComplete ? '✓' : index + 1}
              </span>
              <span className={styles.label}>
                {step}
                {isComplete && <span className="visually-hidden"> (completed)</span>}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
