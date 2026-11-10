import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Field, RadioGroup, TextInput } from '@/components'
import { REPORTER_TYPE_LABELS, REPORTER_TYPES } from '@/domain/report'
import { ErrorSummary } from '../ErrorSummary'
import { reporterSchema, type ReporterFormValues } from '../schemas'
import { StepActions } from '../StepActions'
import { summaryItems, useAutosave, useErrorSummaryFocus, type FieldSpec } from '../stepSupport'
import type { StepProps } from './types'

const ids = {
  reporterType: 'reporter-type',
  name: 'reporter-name',
  email: 'reporter-email',
  phone: 'reporter-phone',
}

const fields: FieldSpec<ReporterFormValues>[] = [
  { name: 'reporterType', focusId: `${ids.reporterType}-${REPORTER_TYPES[0]}` },
  { name: 'name', focusId: ids.name },
  { name: 'email', focusId: ids.email },
  { name: 'phone', focusId: ids.phone },
]

const reporterTypeOptions = REPORTER_TYPES.map((value) => ({
  value,
  label: REPORTER_TYPE_LABELS[value],
}))

export function ReporterStep({
  defaultValues,
  onAutosave,
  onContinue,
  onBack,
}: StepProps<ReporterFormValues>) {
  const {
    register,
    handleSubmit,
    subscribe,
    formState: { errors },
  } = useForm<ReporterFormValues, unknown, z.output<typeof reporterSchema>>({
    resolver: zodResolver(reporterSchema),
    defaultValues: { name: '', email: '', phone: '', ...defaultValues },
    shouldFocusError: false,
  })
  useAutosave(subscribe, onAutosave)
  const { summaryRef, focusSummary } = useErrorSummaryFocus()

  return (
    <form noValidate onSubmit={handleSubmit(onContinue, focusSummary)}>
      <ErrorSummary ref={summaryRef} items={summaryItems(fields, errors)} />
      <RadioGroup
        id={ids.reporterType}
        legend="Who is making this report?"
        options={reporterTypeOptions}
        error={errors.reporterType?.message}
        {...register('reporterType')}
      />
      <Field id={ids.name} label="Full name" error={errors.name?.message}>
        <TextInput autoComplete="name" {...register('name')} />
      </Field>
      <Field
        id={ids.email}
        label="Email address"
        hint="We will use this if the safety team needs more information"
        error={errors.email?.message}
      >
        <TextInput type="email" autoComplete="email" {...register('email')} />
      </Field>
      <Field id={ids.phone} label="Phone number" optional error={errors.phone?.message}>
        <TextInput type="tel" autoComplete="tel" {...register('phone')} />
      </Field>
      <StepActions onBack={onBack} />
    </form>
  )
}
