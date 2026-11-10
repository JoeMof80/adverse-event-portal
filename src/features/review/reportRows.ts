import type { SummaryRow } from '@/components'
import {
  OUTCOME_LABELS,
  REPORTER_TYPE_LABELS,
  ROUTE_LABELS,
  SERIOUSNESS_CRITERION_LABELS,
  SEX_LABELS,
  type Report,
} from '@/domain/report'
import { formatDate } from '@/lib/formatDate'

const date = (value: string | undefined) => (value ? formatDate(value) : undefined)

/** The read-only presentation of a submitted report, section by section. */
export function reportSections(report: Report): { title: string; rows: SummaryRow[] }[] {
  const { reporter, patient, medicine, reaction } = report
  const hospitalised = reaction.seriousnessCriteria?.includes('hospitalisation') ?? false
  const recovered = reaction.outcome === 'recovered' || reaction.outcome === 'recovering'

  return [
    {
      title: 'Reporter details',
      rows: [
        { label: 'Reporting as', value: REPORTER_TYPE_LABELS[reporter.reporterType] },
        { label: 'Full name', value: reporter.name },
        { label: 'Email address', value: reporter.email },
        { label: 'Phone number', value: reporter.phone },
      ],
    },
    {
      title: 'Patient details',
      rows: [
        { label: 'Initials', value: patient.initials },
        { label: 'Age', value: patient.age !== undefined ? String(patient.age) : undefined },
        { label: 'Date of birth', value: date(patient.dateOfBirth) },
        // Data seeded before 'other' was removed may still hold it; show the raw value rather than nothing.
        { label: 'Sex', value: SEX_LABELS[patient.sex] ?? patient.sex },
      ],
    },
    {
      title: 'Suspect medicine',
      rows: [
        { label: 'Medicine', value: medicine.name },
        { label: 'Dose', value: medicine.dose },
        { label: 'Route', value: ROUTE_LABELS[medicine.route] },
        { label: 'Started', value: date(medicine.startDate) },
        { label: 'Stopped', value: date(medicine.stopDate) ?? 'Still taking' },
      ],
    },
    {
      title: 'Reaction and seriousness',
      rows: [
        { label: 'Description', value: reaction.description },
        { label: 'Started', value: date(reaction.onsetDate) },
        { label: 'Outcome', value: OUTCOME_LABELS[reaction.outcome] },
        ...(recovered ? [{ label: 'Recovery date', value: date(reaction.recoveryDate) }] : []),
        { label: 'Serious', value: reaction.serious ? 'Yes' : 'No' },
        ...(reaction.serious
          ? [
              {
                label: 'Why it was serious',
                value: (reaction.seriousnessCriteria ?? [])
                  .map((criterion) => SERIOUSNESS_CRITERION_LABELS[criterion])
                  .join(', '),
              },
            ]
          : []),
        ...(hospitalised
          ? [
              { label: 'Admitted to hospital', value: date(reaction.hospitalAdmissionDate) },
              {
                label: 'Discharged',
                value: date(reaction.hospitalDischargeDate) ?? 'Still in hospital',
              },
            ]
          : []),
      ],
    },
  ]
}
