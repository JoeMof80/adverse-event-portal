import { ChoiceGroup, type ChoiceGroupProps } from './ChoiceGroup'

export type RadioGroupProps = ChoiceGroupProps & {
  /** The selected value, for controlled use. Leave undefined when using React Hook Form's register. */
  value?: string
}

export function RadioGroup({ value, ...props }: RadioGroupProps) {
  return (
    <ChoiceGroup
      type="radio"
      isChecked={(optionValue) => (value === undefined ? undefined : value === optionValue)}
      {...props}
    />
  )
}
