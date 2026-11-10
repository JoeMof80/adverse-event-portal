import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Field, RadioGroup, TextInput } from '@/components'
import { SEX_LABELS, SEXES } from '@/domain/report'
import { ErrorSummary } from '../ErrorSummary'
import { patientSchema, type PatientFormValues } from '../schemas'
import { StepActions } from '../StepActions'
import { summaryItems, useAutosave, useErrorSummaryFocus, type FieldSpec } from '../stepSupport'
import type { StepProps } from './types'

const ids = {
  initials: 'patient-initials',
  age: 'patient-age',
  dateOfBirth: 'patient-date-of-birth',
  sex: 'patient-sex',
}

const fields: FieldSpec<PatientFormValues>[] = [
  { name: 'initials', focusId: ids.initials },
  { name: 'age', focusId: ids.age },
  { name: 'dateOfBirth', focusId: ids.dateOfBirth },
  { name: 'sex', focusId: `${ids.sex}-${SEXES[0]}` },
]

const sexOptions = SEXES.map((value) => ({ value, label: SEX_LABELS[value] }))

export function PatientStep({
  defaultValues,
  onAutosave,
  onContinue,
  onBack,
}: StepProps<PatientFormValues>) {
  const {
    register,
    handleSubmit,
    subscribe,
    formState: { errors },
  } = useForm<PatientFormValues, unknown, z.output<typeof patientSchema>>({
    resolver: zodResolver(patientSchema),
    defaultValues: { initials: '', age: '', dateOfBirth: '', ...defaultValues },
    shouldFocusError: false,
  })
  useAutosave(subscribe, onAutosave)
  const { summaryRef, focusSummary } = useErrorSummaryFocus()

  return (
    <form noValidate onSubmit={handleSubmit(onContinue, focusSummary)}>
      <ErrorSummary ref={summaryRef} items={summaryItems(fields, errors)} />
      <Field
        id={ids.initials}
        label="Patient's initials"
        hint="Do not enter the patient's full name"
        error={errors.initials?.message}
      >
        <TextInput maxLength={4} autoComplete="off" className="short" {...register('initials')} />
      </Field>
      <Field
        id={ids.age}
        label="Age in years"
        hint="Enter the patient's age or their date of birth below"
        error={errors.age?.message}
      >
        <TextInput inputMode="numeric" maxLength={3} {...register('age')} />
      </Field>
      <Field
        id={ids.dateOfBirth}
        label="Date of birth"
        optional
        error={errors.dateOfBirth?.message}
      >
        <TextInput type="date" {...register('dateOfBirth')} />
      </Field>
      <RadioGroup
        id={ids.sex}
        legend="Patient's sex"
        options={sexOptions}
        inline
        error={errors.sex?.message}
        {...register('sex')}
      />
      <StepActions onBack={onBack} />
    </form>
  )
}
