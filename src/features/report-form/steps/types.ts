export type StepProps<T> = {
  defaultValues: Partial<T> | undefined
  onAutosave: (values: Partial<T>) => void
  onContinue: (values: Partial<T>) => void
  onBack?: () => void
}
