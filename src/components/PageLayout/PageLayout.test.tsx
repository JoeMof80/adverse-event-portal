import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from '@/test/axe'
import { PageLayout } from './PageLayout'

describe('PageLayout', () => {
  it('provides a skip link as the first focusable element, targeting main', async () => {
    const user = userEvent.setup()
    render(
      <PageLayout nav={<a href="/reports">Reports</a>}>
        <h1>Page</h1>
      </PageLayout>,
    )
    await user.tab()
    const skipLink = screen.getByRole('link', { name: 'Skip to main content' })
    expect(skipLink).toHaveFocus()
    expect(skipLink).toHaveAttribute('href', '#main-content')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
  })

  it('renders header and main landmarks with the nav inside the header', () => {
    render(
      <PageLayout nav={<a href="/reports">Reports</a>}>
        <h1>Page</h1>
      </PageLayout>,
    )
    expect(screen.getByRole('banner')).toContainElement(
      screen.getByRole('link', { name: 'Reports' }),
    )
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { level: 1 }))
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <PageLayout>
        <h1>Page</h1>
      </PageLayout>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
