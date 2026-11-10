import type { ReportSubmission } from '@/domain/report'
import {
  medicineSchema,
  patientSchema,
  reactionSchema,
  reporterSchema,
  type MedicineFormValues,
  type PatientFormValues,
  type ReactionFormValues,
  type ReporterFormValues,
} from './schemas'

/** A report in progress: raw form values per step, saved in the reporter's browser. */
export type ReportDraft = {
  stepIndex: number
  reporter?: Partial<ReporterFormValues>
  patient?: Partial<PatientFormValues>
  medicine?: Partial<MedicineFormValues>
  reaction?: Partial<ReactionFormValues>
  updatedAt: string
}

export type DraftSection = 'reporter' | 'patient' | 'medicine' | 'reaction'

export function emptyDraft(): ReportDraft {
  return { stepIndex: 0, updatedAt: new Date().toISOString() }
}

function draftKey(userId: string): string {
  return `aep.draft.${userId}`
}

export function loadDraft(userId: string): ReportDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ReportDraft>
    if (typeof parsed.stepIndex !== 'number' || typeof parsed.updatedAt !== 'string') return null
    return parsed as ReportDraft
  } catch {
    return null
  }
}

export function saveDraft(userId: string, draft: ReportDraft): void {
  try {
    localStorage.setItem(draftKey(userId), JSON.stringify(draft))
  } catch {
    // The in-memory draft still exists for this page load.
  }
}

export function clearDraft(userId: string): void {
  try {
    localStorage.removeItem(draftKey(userId))
  } catch {
    // Nothing to clear.
  }
}

/**
 * Turns a completed draft into the submission the API accepts. Each step is re-validated
 * through its schema, so this throws if a step was skipped or edited into an invalid state.
 */
export function toSubmission(draft: ReportDraft): ReportSubmission {
  const reporter = reporterSchema.parse(draft.reporter ?? {})
  const patient = patientSchema.parse(draft.patient ?? {})
  const medicine = medicineSchema.parse(draft.medicine ?? {})
  const reaction = reactionSchema.parse(draft.reaction ?? {})

  const serious = reaction.serious === 'yes'
  const hospitalised = serious && reaction.seriousnessCriteria.includes('hospitalisation')
  const recovered = reaction.outcome === 'recovered' || reaction.outcome === 'recovering'

  return {
    reporter: {
      reporterType: reporter.reporterType,
      name: reporter.name,
      email: reporter.email,
      ...(reporter.phone ? { phone: reporter.phone } : {}),
    },
    patient: {
      initials: patient.initials,
      sex: patient.sex,
      ...(patient.age ? { age: Number(patient.age) } : {}),
      ...(patient.dateOfBirth ? { dateOfBirth: patient.dateOfBirth } : {}),
    },
    medicine: {
      name: medicine.name,
      dose: medicine.dose,
      route: medicine.route,
      startDate: medicine.startDate,
      ...(medicine.stopDate ? { stopDate: medicine.stopDate } : {}),
    },
    reaction: {
      description: reaction.description,
      onsetDate: reaction.onsetDate,
      outcome: reaction.outcome,
      serious,
      ...(recovered && reaction.recoveryDate ? { recoveryDate: reaction.recoveryDate } : {}),
      ...(serious ? { seriousnessCriteria: reaction.seriousnessCriteria } : {}),
      ...(hospitalised && reaction.hospitalAdmissionDate
        ? { hospitalAdmissionDate: reaction.hospitalAdmissionDate }
        : {}),
      ...(hospitalised && reaction.hospitalDischargeDate
        ? { hospitalDischargeDate: reaction.hospitalDischargeDate }
        : {}),
    },
  }
}
