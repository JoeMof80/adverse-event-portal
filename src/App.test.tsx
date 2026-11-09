import { render, screen } from '@testing-library/react'
import { axe } from '@/test/axe'
import App from './App'

describe('App', () => {
  it('renders the portal heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Adverse Event Reporting Portal',
    )
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<App />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
