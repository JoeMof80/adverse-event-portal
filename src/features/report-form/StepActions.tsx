import { Button } from '@/components'
import styles from './StepActions.module.css'

type StepActionsProps = {
  onBack?: () => void
  continueLabel?: string
  busy?: boolean
}

export function StepActions({
  onBack,
  continueLabel = 'Continue',
  busy = false,
}: StepActionsProps) {
  return (
    <div className={styles.actions}>
      <Button type="submit" disabled={busy}>
        {continueLabel}
      </Button>
      {onBack && (
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
      )}
    </div>
  )
}
