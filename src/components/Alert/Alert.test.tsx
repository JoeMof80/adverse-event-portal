import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { axe } from '@/test/axe'
import { Alert } from './Alert'

describe('Alert', () => {
  it('announces errors assertively and other variants politely', () => {
    render(
      <>
        <Alert variant="error" title="There is a problem">
          Fix the errors below
        </Alert>
        <Alert variant="success">Report submitted</Alert>
      </>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('There is a problem')
    expect(screen.getByRole('status')).toHaveTextContent('Report submitted')
  })

  it('can receive focus programmatically', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Alert ref={ref}>Saved</Alert>)
    ref.current?.focus()
    expect(screen.getByRole('status')).toHaveFocus()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Alert variant="error" title="There is a problem">
        Fix the errors below
      </Alert>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
