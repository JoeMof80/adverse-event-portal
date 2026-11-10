import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Field, Select, TextInput } from '@/components'
import { ROUTE_LABELS, ROUTES } from '@/domain/report'
import { ErrorSummary } from '../ErrorSummary'
import { medicineSchema, type MedicineFormValues } from '../schemas'
import { StepActions } from '../StepActions'
import { summaryItems, useAutosave, useErrorSummaryFocus, type FieldSpec } from '../stepSupport'
import type { StepProps } from './types'

const ids = {
  name: 'medicine-name',
  dose: 'medicine-dose',
  route: 'medicine-route',
  startDate: 'medicine-start-date',
  stopDate: 'medicine-stop-date',
}

const fields: FieldSpec<MedicineFormValues>[] = [
  { name: 'name', focusId: ids.name },
  { name: 'dose', focusId: ids.dose },
  { name: 'route', focusId: ids.route },
  { name: 'startDate', focusId: ids.startDate },
  { name: 'stopDate', focusId: ids.stopDate },
]

const routeOptions = ROUTES.map((value) => ({ value, label: ROUTE_LABELS[value] }))

export function MedicineStep({
  defaultValues,
  onAutosave,
  onContinue,
  onBack,
}: StepProps<MedicineFormValues>) {
  const {
    register,
    handleSubmit,
    subscribe,
    formState: { errors },
  } = useForm<MedicineFormValues, unknown, z.output<typeof medicineSchema>>({
    resolver: zodResolver(medicineSchema),
    defaultValues: { name: '', dose: '', startDate: '', stopDate: '', ...defaultValues },
    shouldFocusError: false,
  })
  useAutosave(subscribe, onAutosave)
  const { summaryRef, focusSummary } = useErrorSummaryFocus()

  return (
    <form noValidate onSubmit={handleSubmit(onContinue, focusSummary)}>
      <ErrorSummary ref={summaryRef} items={summaryItems(fields, errors)} />
      <Field
        id={ids.name}
        label="Name of the medicine"
        hint="Include the strength if you know it, for example Amoxicillin 500mg capsules"
        error={errors.name?.message}
      >
        <TextInput autoComplete="off" {...register('name')} />
      </Field>
      <Field
        id={ids.dose}
        label="Dose and how often"
        hint="For example, 500mg three times a day"
        error={errors.dose?.message}
      >
        <TextInput autoComplete="off" {...register('dose')} />
      </Field>
      <Field id={ids.route} label="How was it taken?" error={errors.route?.message}>
        <Select options={routeOptions} placeholder="Select a route" {...register('route')} />
      </Field>
      <Field
        id={ids.startDate}
        label="Date the medicine was started"
        error={errors.startDate?.message}
      >
        <TextInput type="date" {...register('startDate')} />
      </Field>
      <Field
        id={ids.stopDate}
        label="Date the medicine was stopped"
        hint="Leave blank if the patient is still taking it"
        optional
        error={errors.stopDate?.message}
      >
        <TextInput type="date" {...register('stopDate')} />
      </Field>
      <StepActions onBack={onBack} />
    </form>
  )
}
