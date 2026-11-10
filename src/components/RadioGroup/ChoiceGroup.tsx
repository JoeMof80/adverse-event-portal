import { useId, type ComponentProps } from 'react'
import { cx } from '@/lib/cx'
import styles from './ChoiceGroup.module.css'

export type ChoiceOption = {
  value: string
  label: string
  hint?: string
}

/**
 * Props shared by RadioGroup and CheckboxGroup. `name`, `onChange`, `onBlur`, `ref` and
 * `disabled` are spread onto every input, so a React Hook Form `register()` result can be
 * spread straight onto the group.
 */
export type ChoiceGroupProps = Pick<
  ComponentProps<'input'>,
  'name' | 'onChange' | 'onBlur' | 'ref' | 'disabled'
> & {
  legend: string
  hint?: string
  error?: string
  optional?: boolean
  options: readonly ChoiceOption[]
  /** Lay options out in a row rather than a column. Suits short yes/no choices. */
  inline?: boolean
  id?: string
}

type InternalProps = ChoiceGroupProps & {
  type: 'radio' | 'checkbox'
  isChecked: (value: string) => boolean | undefined
}

export function ChoiceGroup({
  type,
  isChecked,
  legend,
  hint,
  error,
  optional = false,
  options,
  inline = false,
  id: idProp,
  name,
  onChange,
  onBlur,
  ref,
  disabled,
}: InternalProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ')

  return (
    <fieldset
      className={cx(styles.group, error && styles.hasError)}
      data-invalid={error ? 'true' : undefined}
      aria-describedby={describedBy || undefined}
      disabled={disabled}
    >
      <legend className={styles.legend}>
        {legend}
        {optional && <span className={styles.optional}> (optional)</span>}
      </legend>
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
      <div className={cx(styles.options, inline && styles.inline)}>
        {options.map((option) => {
          const optionId = `${id}-${option.value}`
          const optionHintId = `${optionId}-hint`
          return (
            <div key={option.value} className={styles.option}>
              <input
                type={type}
                id={optionId}
                name={name}
                value={option.value}
                checked={isChecked(option.value)}
                aria-describedby={option.hint ? optionHintId : undefined}
                className={styles.input}
                onChange={onChange}
                onBlur={onBlur}
                ref={ref}
              />
              <label htmlFor={optionId} className={styles.label}>
                {option.label}
              </label>
              {option.hint && (
                <p id={optionHintId} className={styles.optionHint}>
                  {option.hint}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}
