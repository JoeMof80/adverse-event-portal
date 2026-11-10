import { render, screen } from '@testing-library/react'
import { axe } from '@/test/axe'
import { TextInput } from '@/components/TextInput/TextInput'
import { Field } from './Field'

describe('Field', () => {
  it('links the label to the input', () => {
    render(
      <Field label="Patient initials">
        <TextInput />
      </Field>,
    )
    expect(screen.getByLabelText('Patient initials')).toBeInstanceOf(HTMLInputElement)
  })

  it('describes the input with the hint', () => {
    render(
      <Field label="Patient initials" hint="For example, JS">
        <TextInput />
      </Field>,
    )
    expect(screen.getByLabelText('Patient initials')).toHaveAccessibleDescription('For example, JS')
  })

  it('marks the input invalid and describes it with hint and error', () => {
    render(
      <Field label="Patient initials" hint="For example, JS" error="Enter the patient's initials">
        <TextInput />
      </Field>,
    )
    const input = screen.getByLabelText('Patient initials')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription(
      /For example, JS Error:\s*Enter the patient's initials/,
    )
  })

  it('is required by default and says so when optional', () => {
    render(
      <>
        <Field label="Required thing">
          <TextInput />
        </Field>
        <Field label="Optional thing" optional>
          <TextInput />
        </Field>
      </>,
    )
    expect(screen.getByLabelText('Required thing')).toHaveAttribute('aria-required', 'true')
    const optionalInput = screen.getByLabelText('Optional thing (optional)')
    expect(optionalInput).not.toHaveAttribute('aria-required')
  })

  it('throws a helpful error when a control is used outside a Field', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TextInput />)).toThrow('TextInput must be rendered inside a Field')
    vi.restoreAllMocks()
  })

  it('has no accessibility violations with hint and error', async () => {
    const { container } = render(
      <Field label="Patient initials" hint="For example, JS" error="Enter the patient's initials">
        <TextInput />
      </Field>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
