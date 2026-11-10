import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from '@/test/axe'
import { RadioGroup } from './RadioGroup'

const options = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

describe('RadioGroup', () => {
  it('groups the radios under the legend', () => {
    render(<RadioGroup legend="Was the reaction serious?" name="serious" options={options} />)
    const group = screen.getByRole('group', { name: 'Was the reaction serious?' })
    expect(group).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(2)
  })

  it('moves selection with the arrow keys and reports the change', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <RadioGroup
        legend="Was the reaction serious?"
        name="serious"
        options={options}
        onChange={onChange}
      />,
    )
    await user.tab()
    expect(screen.getByRole('radio', { name: 'Yes' })).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('radio', { name: 'No' })).toBeChecked()
    expect(onChange).toHaveBeenCalled()
  })

  it('describes the group with hint and error', () => {
    render(
      <RadioGroup
        legend="Was the reaction serious?"
        name="serious"
        options={options}
        hint="Serious includes hospitalisation"
        error="Select yes or no"
      />,
    )
    expect(screen.getByRole('group')).toHaveAccessibleDescription(
      /Serious includes hospitalisation Error:\s*Select yes or no/,
    )
  })

  it('reflects a controlled value', () => {
    render(
      <RadioGroup
        legend="Was the reaction serious?"
        name="serious"
        options={options}
        value="no"
        onChange={() => {}}
      />,
    )
    expect(screen.getByRole('radio', { name: 'No' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Yes' })).not.toBeChecked()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <RadioGroup
        legend="Was the reaction serious?"
        name="serious"
        options={[{ ...options[0]!, hint: 'Including hospitalisation' }, options[1]!]}
        error="Select yes or no"
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
