import type { Role } from '@/auth/types'

/*
 * The adverse event report as the API sees it. Drafts never reach the API: they live in the
 * reporter's browser until submission (see the autosave work in Phase 5).
 */

export const REPORT_STATUSES = ['submitted', 'under-review', 'closed'] as const
export type ReportStatus = (typeof REPORT_STATUSES)[number]

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  submitted: 'Submitted',
  'under-review': 'Under review',
  closed: 'Closed',
}

/** Which status changes a reviewer may make from each status. */
export const STATUS_TRANSITIONS: Record<ReportStatus, readonly ReportStatus[]> = {
  submitted: ['under-review'],
  'under-review': ['closed'],
  closed: [],
}

export function isReportStatus(value: unknown): value is ReportStatus {
  return typeof value === 'string' && (REPORT_STATUSES as readonly string[]).includes(value)
}

export const REPORTER_TYPES = ['patient', 'carer', 'healthcare-professional'] as const
export type ReporterType = (typeof REPORTER_TYPES)[number]
export const REPORTER_TYPE_LABELS: Record<ReporterType, string> = {
  patient: 'Patient',
  carer: 'Carer or family member',
  'healthcare-professional': 'Healthcare professional',
}

export const SEXES = ['female', 'male', 'other', 'unknown'] as const
export type Sex = (typeof SEXES)[number]
export const SEX_LABELS: Record<Sex, string> = {
  female: 'Female',
  male: 'Male',
  other: 'Other',
  unknown: 'Not known',
}

export const ROUTES = [
  'oral',
  'intravenous',
  'intramuscular',
  'subcutaneous',
  'topical',
  'inhaled',
  'other',
] as const
export type RouteOfAdministration = (typeof ROUTES)[number]
export const ROUTE_LABELS: Record<RouteOfAdministration, string> = {
  oral: 'Oral',
  intravenous: 'Intravenous',
  intramuscular: 'Intramuscular',
  subcutaneous: 'Subcutaneous',
  topical: 'Topical',
  inhaled: 'Inhaled',
  other: 'Other',
}

export const OUTCOMES = ['recovered', 'recovering', 'not-recovered', 'unknown'] as const
export type Outcome = (typeof OUTCOMES)[number]
export const OUTCOME_LABELS: Record<Outcome, string> = {
  recovered: 'Recovered',
  recovering: 'Recovering',
  'not-recovered': 'Not recovered',
  unknown: 'Not known',
}

export const SERIOUSNESS_CRITERIA = [
  'hospitalisation',
  'life-threatening',
  'disability',
  'congenital-anomaly',
  'death',
  'other-medically-important',
] as const
export type SeriousnessCriterion = (typeof SERIOUSNESS_CRITERIA)[number]
export const SERIOUSNESS_CRITERION_LABELS: Record<SeriousnessCriterion, string> = {
  hospitalisation: 'Caused or prolonged hospitalisation',
  'life-threatening': 'Life-threatening',
  disability: 'Caused persistent or significant disability',
  'congenital-anomaly': 'Congenital anomaly or birth defect',
  death: 'Resulted in death',
  'other-medically-important': 'Other medically important condition',
}

export type ReporterDetails = {
  reporterType: ReporterType
  name: string
  email: string
  phone?: string
}

export type PatientDetails = {
  initials: string
  /** Either an age in years or a date of birth is given. */
  age?: number
  dateOfBirth?: string
  sex: Sex
}

export type MedicineDetails = {
  name: string
  dose: string
  route: RouteOfAdministration
  startDate: string
  /** Absent while the patient is still taking the medicine. */
  stopDate?: string
}

export type ReactionDetails = {
  description: string
  onsetDate: string
  outcome: Outcome
  /** Required when the outcome is recovered or recovering. */
  recoveryDate?: string
  serious: boolean
  /** Required when serious. */
  seriousnessCriteria?: SeriousnessCriterion[]
  /** Required when the criteria include hospitalisation. */
  hospitalAdmissionDate?: string
  hospitalDischargeDate?: string
}

/** What the reporter submits. */
export type ReportSubmission = {
  reporter: ReporterDetails
  patient: PatientDetails
  medicine: MedicineDetails
  reaction: ReactionDetails
}

export type ReviewNote = {
  id: string
  reportId: string
  authorId: string
  authorName: string
  body: string
  createdAt: string
}

export type Report = ReportSubmission & {
  /** Also the human-readable reference, for example AER-0001. */
  id: string
  status: ReportStatus
  reporterId: string
  reporterName: string
  submittedAt: string
  updatedAt: string
  assignedReviewerId: string | null
  assignedReviewerName: string | null
  notes: ReviewNote[]
}

/** The row shape for the reports list. */
export type ReportSummary = {
  id: string
  status: ReportStatus
  submittedAt: string
  updatedAt: string
  reporterName: string
  patientInitials: string
  medicineName: string
  serious: boolean
  assignedReviewerName: string | null
}

export const AUDIT_ACTIONS = ['submitted', 'status-changed', 'note-added', 'reassigned'] as const
export type AuditAction = (typeof AUDIT_ACTIONS)[number]
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  submitted: 'Report submitted',
  'status-changed': 'Status changed',
  'note-added': 'Review note added',
  reassigned: 'Reviewer reassigned',
}

export type AuditEvent = {
  id: string
  reportId: string
  actorId: string
  actorName: string
  actorRole: Role
  action: AuditAction
  at: string
  /** For status changes and reassignments, the value before the action. */
  before?: string
  /** For status changes and reassignments, the value after the action. */
  after?: string
  /** Free text, for example the first line of a note. */
  detail?: string
}

export function toSummary(report: Report): ReportSummary {
  return {
    id: report.id,
    status: report.status,
    submittedAt: report.submittedAt,
    updatedAt: report.updatedAt,
    reporterName: report.reporterName,
    patientInitials: report.patient.initials,
    medicineName: report.medicine.name,
    serious: report.reaction.serious,
    assignedReviewerName: report.assignedReviewerName,
  }
}
