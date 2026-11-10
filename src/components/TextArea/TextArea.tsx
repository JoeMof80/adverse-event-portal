import type { ComponentProps } from 'react'
import { useFieldContext } from '@/components/Field/FieldContext'
import { cx } from '@/lib/cx'
import styles from './TextArea.module.css'

export type TextAreaProps = Omit<
  ComponentProps<'textarea'>,
  'id' | 'aria-describedby' | 'aria-invalid' | 'aria-required'
>

/** A multi-line text input. Must be rendered inside a Field. */
export function TextArea({ className, rows = 5, ...props }: TextAreaProps) {
  const { id, describedBy, invalid, required } = useFieldContext('TextArea')
  return (
    <textarea
      id={id}
      rows={rows}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      aria-required={required || undefined}
      className={cx(styles.textarea, invalid && styles.invalid, className)}
      {...props}
    />
  )
}
