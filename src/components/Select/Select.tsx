import type { ComponentProps } from 'react'
import { useFieldContext } from '@/components/Field/FieldContext'
import { cx } from '@/lib/cx'
import styles from './Select.module.css'

export type SelectOption = { value: string; label: string }

export type SelectProps = Omit<
  ComponentProps<'select'>,
  'id' | 'aria-describedby' | 'aria-invalid' | 'aria-required' | 'children'
> & {
  options: readonly SelectOption[]
  /** Shown as a disabled first option until a value is chosen. */
  placeholder?: string
}

/** A native select. Must be rendered inside a Field, which supplies its label and aria wiring. */
export function Select({ options, placeholder, className, ...props }: SelectProps) {
  const { id, describedBy, invalid, required } = useFieldContext('Select')
  return (
    <select
      id={id}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      aria-required={required || undefined}
      className={cx(styles.select, invalid && styles.invalid, className)}
      {...props}
    >
      {placeholder !== undefined && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
