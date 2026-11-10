import { Alert, Button } from '@/components'
import {
  OUTCOME_LABELS,
  REPORTER_TYPE_LABELS,
  ROUTE_LABELS,
  SERIOUSNESS_CRITERION_LABELS,
  SEX_LABELS,
} from '@/domain/report'
import { formatDate } from '@/lib/formatDate'
import type { ReportDraft } from '../draft'
import { StepActions } from '../StepActions'
import styles from './ReviewStep.module.css'

type ReviewStepProps = {
  draft: ReportDraft
  onEdit: (stepIndex: number) => void
  onSubmit: () => void
  onBack: () => void
  submitting: boolean
  submitError: string | null
}

type Row = { label: string; value: string | undefined }

function Section({
  title,
  stepIndex,
  rows,
  onEdit,
}: {
  title: string
  stepIndex: number
  rows: Row[]
  onEdit: (i: number) => void
}) {
  return (
    <section className={styles.section} aria-labelledby={`review-${stepIndex}`}>
      <div className={styles.sectionHeader}>
        <h2 id={`review-${stepIndex}`}>{title}</h2>
        <Button
          variant="secondary"
          onClick={() => onEdit(stepIndex)}
          aria-label={`Change ${title.toLowerCase()}`}
        >
          Change
        </Button>
      </div>
      <dl className={styles.list}>
        {rows.map((row) => (
          <div key={row.label} className={styles.row}>
            <dt>{row.label}</dt>
            <dd>{row.value || <span className={styles.empty}>Not provided</span>}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

const date = (value: string | undefined) => (value ? formatDate(value) : undefined)

export function ReviewStep({
  draft,
  onEdit,
  onSubmit,
  onBack,
  submitting,
  submitError,
}: ReviewStepProps) {
  const { reporter = {}, patient = {}, medicine = {}, reaction = {} } = draft
  const serious = reaction.serious === 'yes'
  const criteria = Array.isArray(reaction.seriousnessCriteria) ? reaction.seriousnessCriteria : []
  const hospitalised = serious && criteria.includes('hospitalisation')
  const recovered = reaction.outcome === 'recovered' || reaction.outcome === 'recovering'

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <p>Check the details below. You can change any section before you submit.</p>
      {submitError && (
        <Alert variant="error" title="The report could not be submitted">
          <p>{submitError}</p>
        </Alert>
      )}
      <Section
        title="Reporter details"
        stepIndex={0}
        onEdit={onEdit}
        rows={[
          {
            label: 'Reporting as',
            value: reporter.reporterType && REPORTER_TYPE_LABELS[reporter.reporterType],
          },
          { label: 'Full name', value: reporter.name },
          { label: 'Email address', value: reporter.email },
          { label: 'Phone number', value: reporter.phone },
        ]}
      />
      <Section
        title="Patient details"
        stepIndex={1}
        onEdit={onEdit}
        rows={[
          { label: 'Initials', value: patient.initials?.toUpperCase() },
          { label: 'Age', value: patient.age },
          { label: 'Date of birth', value: date(patient.dateOfBirth) },
          { label: 'Sex', value: patient.sex && SEX_LABELS[patient.sex] },
        ]}
      />
      <Section
        title="Suspect medicine"
        stepIndex={2}
        onEdit={onEdit}
        rows={[
          { label: 'Medicine', value: medicine.name },
          { label: 'Dose', value: medicine.dose },
          { label: 'Route', value: medicine.route && ROUTE_LABELS[medicine.route] },
          { label: 'Started', value: date(medicine.startDate) },
          { label: 'Stopped', value: date(medicine.stopDate) ?? 'Still taking' },
        ]}
      />
      <Section
        title="Reaction and seriousness"
        stepIndex={3}
        onEdit={onEdit}
        rows={[
          { label: 'Description', value: reaction.description },
          { label: 'Started', value: date(reaction.onsetDate) },
          { label: 'Outcome', value: reaction.outcome && OUTCOME_LABELS[reaction.outcome] },
          ...(recovered ? [{ label: 'Recovery date', value: date(reaction.recoveryDate) }] : []),
          {
            label: 'Serious',
            value: reaction.serious === undefined ? undefined : serious ? 'Yes' : 'No',
          },
          ...(serious
            ? [
                {
                  label: 'Why it was serious',
                  value: criteria.map((c) => SERIOUSNESS_CRITERION_LABELS[c]).join(', '),
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
        ]}
      />
      <StepActions onBack={onBack} continueLabel="Accept and submit report" busy={submitting} />
    </form>
  )
}
