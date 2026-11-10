import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from '@/test/axe'
import { Field } from '@/components/Field/Field'
import { Select } from './Select'

const options = [
  { value: 'oral', label: 'Oral' },
  { value: 'iv', label: 'Intravenous' },
]

describe('Select', () => {
  it('renders the options with a disabled placeholder first', async () => {
    const user = userEvent.setup()
    render(
      <Field label="Route">
        <Select options={options} placeholder="Choose a route" defaultValue="" />
      </Field>,
    )
    const select = screen.getByLabelText('Route')
    expect(screen.getByRole('option', { name: 'Choose a route' })).toBeDisabled()
    await user.selectOptions(select, 'iv')
    expect(select).toHaveValue('iv')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Field label="Route" error="Choose a route">
        <Select options={options} placeholder="Choose a route" defaultValue="" />
      </Field>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
