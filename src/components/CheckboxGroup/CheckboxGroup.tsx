import { ChoiceGroup, type ChoiceGroupProps } from '@/components/RadioGroup/ChoiceGroup'

export type CheckboxGroupProps = ChoiceGroupProps & {
  /** The selected values, for controlled use. Leave undefined when using React Hook Form's register. */
  value?: readonly string[]
}

export function CheckboxGroup({ value, ...props }: CheckboxGroupProps) {
  return (
    <ChoiceGroup
      type="checkbox"
      isChecked={(optionValue) => (value === undefined ? undefined : value.includes(optionValue))}
      {...props}
    />
  )
}
