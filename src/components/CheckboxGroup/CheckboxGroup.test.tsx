import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from '@/test/axe'
import { CheckboxGroup } from './CheckboxGroup'

const options = [
  { value: 'hospitalisation', label: 'Hospitalisation' },
  { value: 'life-threatening', label: 'Life-threatening' },
]

describe('CheckboxGroup', () => {
  it('allows several options to be checked', async () => {
    const user = userEvent.setup()
    render(<CheckboxGroup legend="Seriousness criteria" name="criteria" options={options} />)
    await user.click(screen.getByRole('checkbox', { name: 'Hospitalisation' }))
    await user.click(screen.getByRole('checkbox', { name: 'Life-threatening' }))
    expect(screen.getAllByRole('checkbox', { checked: true })).toHaveLength(2)
  })

  it('reflects controlled values', () => {
    render(
      <CheckboxGroup
        legend="Seriousness criteria"
        name="criteria"
        options={options}
        value={['life-threatening']}
        onChange={() => {}}
      />,
    )
    expect(screen.getByRole('checkbox', { name: 'Life-threatening' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Hospitalisation' })).not.toBeChecked()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <CheckboxGroup legend="Seriousness criteria" name="criteria" options={options} optional />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
