import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import type { z } from 'zod'
import { CheckboxGroup, Field, RadioGroup, TextArea, TextInput } from '@/components'
import {
  OUTCOME_LABELS,
  OUTCOMES,
  SERIOUSNESS_CRITERIA,
  SERIOUSNESS_CRITERION_LABELS,
} from '@/domain/report'
import { ErrorSummary } from '../ErrorSummary'
import { reactionSchema, type ReactionFormValues } from '../schemas'
import { StepActions } from '../StepActions'
import { summaryItems, useAutosave, useErrorSummaryFocus, type FieldSpec } from '../stepSupport'
import styles from './ReactionStep.module.css'
import type { StepProps } from './types'

const ids = {
  description: 'reaction-description',
  onsetDate: 'reaction-onset-date',
  outcome: 'reaction-outcome',
  recoveryDate: 'reaction-recovery-date',
  serious: 'reaction-serious',
  seriousnessCriteria: 'reaction-criteria',
  hospitalAdmissionDate: 'reaction-admission-date',
  hospitalDischargeDate: 'reaction-discharge-date',
}

const fields: FieldSpec<ReactionFormValues>[] = [
  { name: 'description', focusId: ids.description },
  { name: 'onsetDate', focusId: ids.onsetDate },
  { name: 'outcome', focusId: `${ids.outcome}-${OUTCOMES[0]}` },
  { name: 'recoveryDate', focusId: ids.recoveryDate },
  { name: 'serious', focusId: `${ids.serious}-yes` },
  { name: 'seriousnessCriteria', focusId: `${ids.seriousnessCriteria}-${SERIOUSNESS_CRITERIA[0]}` },
  { name: 'hospitalAdmissionDate', focusId: ids.hospitalAdmissionDate },
  { name: 'hospitalDischargeDate', focusId: ids.hospitalDischargeDate },
]

const outcomeOptions = OUTCOMES.map((value) => ({ value, label: OUTCOME_LABELS[value] }))
const criteriaOptions = SERIOUSNESS_CRITERIA.map((value) => ({
  value,
  label: SERIOUSNESS_CRITERION_LABELS[value],
}))
const seriousOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

export function ReactionStep({
  defaultValues,
  onAutosave,
  onContinue,
  onBack,
}: StepProps<ReactionFormValues>) {
  const {
    register,
    control,
    handleSubmit,
    subscribe,
    formState: { errors },
  } = useForm<ReactionFormValues, unknown, z.output<typeof reactionSchema>>({
    resolver: zodResolver(reactionSchema),
    defaultValues: {
      description: '',
      onsetDate: '',
      recoveryDate: '',
      seriousnessCriteria: [],
      hospitalAdmissionDate: '',
      hospitalDischargeDate: '',
      ...defaultValues,
    },
    shouldFocusError: false,
  })
  useAutosave(subscribe, onAutosave)
  const { summaryRef, focusSummary } = useErrorSummaryFocus()

  // Conditional sections: only the questions that apply are shown.
  const outcome = useWatch({ control, name: 'outcome' })
  const serious = useWatch({ control, name: 'serious' })
  const criteria = useWatch({ control, name: 'seriousnessCriteria' })
  const showRecoveryDate = outcome === 'recovered' || outcome === 'recovering'
  const showCriteria = serious === 'yes'
  const showHospitalDates =
    showCriteria && Array.isArray(criteria) && criteria.includes('hospitalisation')

  return (
    <form noValidate onSubmit={handleSubmit(onContinue, focusSummary)}>
      <ErrorSummary ref={summaryRef} items={summaryItems(fields, errors)} />
      <Field
        id={ids.description}
        label="Describe the reaction"
        hint="What happened, how severe it was, and any treatment given"
        error={errors.description?.message}
      >
        <TextArea {...register('description')} />
      </Field>
      <Field id={ids.onsetDate} label="Date the reaction started" error={errors.onsetDate?.message}>
        <TextInput type="date" {...register('onsetDate')} />
      </Field>
      <RadioGroup
        id={ids.outcome}
        legend="What is the outcome so far?"
        options={outcomeOptions}
        error={errors.outcome?.message}
        {...register('outcome')}
      />
      {showRecoveryDate && (
        <div className={styles.conditional}>
          <Field
            id={ids.recoveryDate}
            label="Date the patient recovered or started to recover"
            error={errors.recoveryDate?.message}
          >
            <TextInput type="date" {...register('recoveryDate')} />
          </Field>
        </div>
      )}
      <RadioGroup
        id={ids.serious}
        legend="Was the reaction serious?"
        hint="Serious means it caused or prolonged a hospital stay, was life-threatening, caused lasting disability, caused a congenital anomaly, resulted in death, or was otherwise medically important"
        options={seriousOptions}
        inline
        error={errors.serious?.message}
        {...register('serious')}
      />
      {showCriteria && (
        <div className={styles.conditional}>
          <CheckboxGroup
            id={ids.seriousnessCriteria}
            legend="Why was it serious?"
            hint="Select all that apply"
            options={criteriaOptions}
            error={errors.seriousnessCriteria?.message}
            {...register('seriousnessCriteria')}
          />
          {showHospitalDates && (
            <div className={styles.conditional}>
              <Field
                id={ids.hospitalAdmissionDate}
                label="Date admitted to hospital"
                error={errors.hospitalAdmissionDate?.message}
              >
                <TextInput type="date" {...register('hospitalAdmissionDate')} />
              </Field>
              <Field
                id={ids.hospitalDischargeDate}
                label="Date discharged from hospital"
                hint="Leave blank if the patient is still in hospital"
                optional
                error={errors.hospitalDischargeDate?.message}
              >
                <TextInput type="date" {...register('hospitalDischargeDate')} />
              </Field>
            </div>
          )}
        </div>
      )}
      <StepActions onBack={onBack} />
    </form>
  )
}
