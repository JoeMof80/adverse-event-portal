import { useEffect, useRef, type RefObject } from 'react'
import type { FieldErrors, FieldValues, UseFormSubscribe } from 'react-hook-form'
import type { ErrorSummaryItem } from './ErrorSummary'

/** Saves the step's values on every change the user makes. */
export function useAutosave<T extends FieldValues>(
  subscribe: UseFormSubscribe<T>,
  onChange: (values: Partial<T>) => void,
): void {
  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ values, name }) => {
          // The subscription also fires on mount with no field name. Opening a step is not a
          // change, so that call must not create or touch a draft.
          if (name) onChange(values as Partial<T>)
        },
      }),
    [subscribe, onChange],
  )
}

/** A ref for the error summary and a handler that focuses it when validation fails. */
export function useErrorSummaryFocus(): {
  summaryRef: RefObject<HTMLDivElement | null>
  focusSummary: () => void
} {
  const summaryRef = useRef<HTMLDivElement>(null)
  const pendingFocus = useRef(false)

  useEffect(() => {
    if (pendingFocus.current && summaryRef.current) {
      pendingFocus.current = false
      summaryRef.current.focus()
    }
  })

  return {
    summaryRef,
    focusSummary: () => {
      // The summary renders on the next commit, so focus it after that.
      pendingFocus.current = true
    },
  }
}

export type FieldSpec<T extends FieldValues> = {
  name: keyof T & string
  /** The id of the control an error link should focus. */
  focusId: string
}

/** Builds the error summary items for a step, in the order the fields appear. */
export function summaryItems<T extends FieldValues>(
  fields: readonly FieldSpec<T>[],
  errors: FieldErrors<T>,
): ErrorSummaryItem[] {
  return fields.flatMap((field) => {
    const message = errors[field.name]?.message
    return typeof message === 'string' ? [{ focusId: field.focusId, message }] : []
  })
}
