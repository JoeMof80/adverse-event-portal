import type { ComponentProps } from 'react'
import { useFieldContext } from '@/components/Field/FieldContext'
import { cx } from '@/lib/cx'
import styles from './TextInput.module.css'

export type TextInputProps = Omit<
  ComponentProps<'input'>,
  'id' | 'aria-describedby' | 'aria-invalid' | 'aria-required'
>

/** A text-like input. Must be rendered inside a Field, which supplies its label and aria wiring. */
export function TextInput({ type = 'text', className, ...props }: TextInputProps) {
  const { id, describedBy, invalid, required } = useFieldContext('TextInput')
  return (
    <input
      id={id}
      type={type}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      aria-required={required || undefined}
      className={cx(styles.input, invalid && styles.invalid, className)}
      {...props}
    />
  )
}
