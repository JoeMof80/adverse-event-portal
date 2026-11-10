import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from '@/test/axe'
import { Button } from './Button'

describe('Button', () => {
  it('defaults to type="button" so it never submits a form by accident', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button')
  })

  it('can be a submit button when asked', () => {
    render(<Button type="submit">Submit</Button>)
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveAttribute('type', 'submit')
  })

  it('calls onClick when activated with the keyboard', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Continue</Button>)
    await user.tab()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('has no accessibility violations in any variant', async () => {
    const { container } = render(
      <>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Danger</Button>
        <Button disabled>Disabled</Button>
      </>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
