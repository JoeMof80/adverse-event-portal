export const REPORT_STEPS = [
  'Reporter details',
  'Patient details',
  'Suspect medicine',
  'Reaction and seriousness',
  'Check your answers',
] as const

export const REVIEW_STEP = REPORT_STEPS.length - 1
