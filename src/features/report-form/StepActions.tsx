import { Button } from '@/components'
import styles from './StepActions.module.css'

type StepActionsProps = {
  onBack?: () => void
  continueLabel?: string
  busy?: boolean
}

/** Back on the left, the forward action on the right, in the direction of travel. */
export function StepActions({
  onBack,
  continueLabel = 'Continue',
  busy = false,
}: StepActionsProps) {
  return (
    <div className={styles.actions}>
      {onBack && (
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
      )}
      <Button type="submit" disabled={busy}>
        {continueLabel}
      </Button>
    </div>
  )
}
