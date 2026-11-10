import { z } from 'zod'
import {
  OUTCOMES,
  REPORTER_TYPES,
  ROUTES,
  SERIOUSNESS_CRITERIA,
  SEXES,
  type SeriousnessCriterion,
} from '@/domain/report'
import { todayIso } from '@/lib/formatDate'

/*
 * One schema per form step. Validation rules live here, not in the components. The schemas
 * take the raw form values (strings from inputs) and produce cleaned values.
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function isRealDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

/** A date input that must be filled in and cannot be in the future. */
function requiredDate(missingMessage: string) {
  return z
    .string({ error: missingMessage })
    .refine((value) => value !== '', { error: missingMessage })
    .refine((value) => value === '' || isRealDate(value), { error: 'Enter a real date' })
    .refine((value) => value === '' || !isRealDate(value) || value <= todayIso(), {
      error: 'The date cannot be in the future',
    })
}

/** A date input that may be left empty but must be real and not in the future if filled. */
const optionalDate = z
  .string()
  .optional()
  .refine((value) => !value || isRealDate(value), { error: 'Enter a real date' })
  .refine((value) => !value || !isRealDate(value) || value <= todayIso(), {
    error: 'The date cannot be in the future',
  })

export const reporterSchema = z.object({
  reporterType: z.enum(REPORTER_TYPES, { error: 'Select who is making this report' }),
  name: z.string().trim().min(1, { error: 'Enter your full name' }),
  email: z
    .string()
    .trim()
    .min(1, { error: 'Enter your email address' })
    .pipe(
      z.email({ error: 'Enter an email address in the correct format, like name@example.com' }),
    ),
  phone: z.string().trim().optional(),
})

export const patientSchema = z
  .object({
    initials: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{1,4}$/, { error: "Enter the patient's initials, up to 4 letters" })
      .transform((value) => value.toUpperCase()),
    age: z.string().trim().optional(),
    dateOfBirth: optionalDate,
    sex: z.enum(SEXES, { error: "Select the patient's sex" }),
  })
  .superRefine((values, ctx) => {
    if (!values.age && !values.dateOfBirth) {
      ctx.addIssue({
        code: 'custom',
        path: ['age'],
        message: "Enter the patient's age or date of birth",
      })
    }
    if (values.age && !(/^\d{1,3}$/.test(values.age) && Number(values.age) <= 130)) {
      ctx.addIssue({
        code: 'custom',
        path: ['age'],
        message: 'Enter an age in whole years between 0 and 130',
      })
    }
  })

export const medicineSchema = z
  .object({
    name: z.string().trim().min(1, { error: 'Enter the name of the medicine' }),
    dose: z.string().trim().min(1, { error: 'Enter the dose and how often it was taken' }),
    route: z.enum(ROUTES, { error: 'Select how the medicine was taken' }),
    startDate: requiredDate('Enter the date the patient started the medicine'),
    stopDate: optionalDate,
  })
  .superRefine((values, ctx) => {
    if (values.stopDate && isRealDate(values.stopDate) && values.stopDate < values.startDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['stopDate'],
        message: 'The stop date must be on or after the start date',
      })
    }
  })

const seriousnessCriteriaInput = z
  .union([z.array(z.enum(SERIOUSNESS_CRITERIA)), z.boolean(), z.undefined()])
  .transform((value): SeriousnessCriterion[] => (Array.isArray(value) ? value : []))

export const reactionSchema = z
  .object({
    description: z.string().trim().min(1, { error: 'Describe the reaction' }),
    onsetDate: requiredDate('Enter the date the reaction started'),
    outcome: z.enum(OUTCOMES, { error: 'Select the outcome of the reaction' }),
    recoveryDate: optionalDate,
    serious: z.enum(['yes', 'no'], { error: 'Select yes if the reaction was serious' }),
    seriousnessCriteria: seriousnessCriteriaInput,
    hospitalAdmissionDate: optionalDate,
    hospitalDischargeDate: optionalDate,
  })
  .superRefine((values, ctx) => {
    const needsRecoveryDate = values.outcome === 'recovered' || values.outcome === 'recovering'
    if (needsRecoveryDate && !values.recoveryDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['recoveryDate'],
        message: 'Enter the date the patient recovered or started to recover',
      })
    }
    if (values.serious !== 'yes') return

    if (values.seriousnessCriteria.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['seriousnessCriteria'],
        message: 'Select at least one reason the reaction was serious',
      })
    }
    if (values.seriousnessCriteria.includes('hospitalisation')) {
      if (!values.hospitalAdmissionDate) {
        ctx.addIssue({
          code: 'custom',
          path: ['hospitalAdmissionDate'],
          message: 'Enter the date the patient was admitted to hospital',
        })
      } else if (
        values.hospitalDischargeDate &&
        isRealDate(values.hospitalDischargeDate) &&
        values.hospitalDischargeDate < values.hospitalAdmissionDate
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['hospitalDischargeDate'],
          message: 'The discharge date must be on or after the admission date',
        })
      }
    }
  })

export type ReporterFormValues = z.input<typeof reporterSchema>
export type PatientFormValues = z.input<typeof patientSchema>
export type MedicineFormValues = z.input<typeof medicineSchema>
export type ReactionFormValues = z.input<typeof reactionSchema>
