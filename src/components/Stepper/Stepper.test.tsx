import { render, screen } from '@testing-library/react'
import { axe } from '@/test/axe'
import { Stepper } from './Stepper'

const steps = ['Reporter', 'Patient', 'Medicine', 'Reaction', 'Review']

describe('Stepper', () => {
  it('marks only the current step with aria-current', () => {
    render(<Stepper steps={steps} currentIndex={2} />)
    const items = screen.getAllByRole('listitem')
    expect(items[2]).toHaveAttribute('aria-current', 'step')
    expect(items.filter((item) => item.hasAttribute('aria-current'))).toHaveLength(1)
  })

  it('summarises progress and labels completed steps for screen readers', () => {
    render(<Stepper steps={steps} currentIndex={2} />)
    expect(screen.getByText('Step 3 of 5')).toBeInTheDocument()
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Reporter (completed)')
    expect(items[1]).toHaveTextContent('Patient (completed)')
    expect(items[2]).not.toHaveTextContent('(completed)')
  })

  it('is a labelled navigation landmark', () => {
    render(<Stepper steps={steps} currentIndex={0} />)
    expect(screen.getByRole('navigation', { name: 'Progress' })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Stepper steps={steps} currentIndex={1} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
