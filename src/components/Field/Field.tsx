import { useId, type ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { FieldContext } from './FieldContext'
import styles from './Field.module.css'

export type FieldProps = {
  label: string
  hint?: string
  error?: string
  /** Fields are required by default; optional fields say so in the label. */
  optional?: boolean
  id?: string
  children: ReactNode
}

export function Field({ label, hint, error, optional = false, id: idProp, children }: FieldProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ')

  return (
    <FieldContext.Provider
      value={{
        id,
        describedBy: describedBy || undefined,
        invalid: Boolean(error),
        required: !optional,
      }}
    >
      <div
        className={cx(styles.field, error && styles.hasError)}
        data-invalid={error ? 'true' : undefined}
      >
        <label htmlFor={id} className={styles.label}>
          {label}
          {optional && <span className={styles.optional}> (optional)</span>}
        </label>
        {hint && (
          <p id={hintId} className={styles.hint}>
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className={styles.error}>
            <span className="visually-hidden">Error: </span>
            {error}
          </p>
        )}
        {children}
      </div>
    </FieldContext.Provider>
  )
}
