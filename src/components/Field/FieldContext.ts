import { createContext, useContext } from 'react'

export type FieldContextValue = {
  id: string
  describedBy: string | undefined
  invalid: boolean
  required: boolean
}

export const FieldContext = createContext<FieldContextValue | null>(null)

/** Gives a form control the ids and aria attributes wired up by its enclosing Field. */
export function useFieldContext(componentName: string): FieldContextValue {
  const context = useContext(FieldContext)
  if (!context) {
    throw new Error(`${componentName} must be rendered inside a Field`)
  }
  return context
}
