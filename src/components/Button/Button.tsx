import type { ComponentProps } from 'react'
import { cx } from '@/lib/cx'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'danger'

export type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant
}

export function Button({ variant = 'primary', type = 'button', className, ...props }: ButtonProps) {
  return <button type={type} className={cx(styles.button, styles[variant], className)} {...props} />
}
