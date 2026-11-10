import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from '@/test/axe'
import { renderApp } from '@/test/renderApp'

describe('route guards', () => {
  it('sends a signed-out visitor to the sign-in page and remembers where they were going', async () => {
    const { router } = renderApp('/reporter/new')
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/sign-in')
    expect(router.state.location.state).toEqual({ returnTo: '/reporter/new' })
  })

  it('sends a reporter who opens the review queue to their own home', async () => {
    const { router } = renderApp('/review', { as: 'reporter' })
    expect(await screen.findByRole('heading', { name: 'Your reports' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/reporter')
  })

  it('sends a reviewer who opens a reporter page to the review queue', async () => {
    const { router } = renderApp('/reporter/new', { as: 'reviewer' })
    expect(await screen.findByRole('heading', { name: 'Review queue' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/review')
  })

  it('lets an admin open the review queue', async () => {
    renderApp('/review', { as: 'admin' })
    expect(await screen.findByRole('heading', { name: 'Review queue' })).toBeInTheDocument()
  })

  it('sends the root path to the home for the role', async () => {
    const { router } = renderApp('/', { as: 'reviewer' })
    await waitFor(() => expect(router.state.location.pathname).toBe('/review'))
  })
})

describe('site navigation', () => {
  it('shows a reporter only reporter links', async () => {
    renderApp('/reporter', { as: 'reporter' })
    const nav = await screen.findByRole('navigation', { name: 'Main' })
    expect(nav).toHaveTextContent('Your reports')
    expect(nav).not.toHaveTextContent('Review queue')
    expect(nav).toHaveTextContent('Signed in as Dr Alex Morgan (Reporter)')
  })

  it('shows a reviewer only the review queue link', async () => {
    renderApp('/review', { as: 'reviewer' })
    const nav = await screen.findByRole('navigation', { name: 'Main' })
    expect(nav).toHaveTextContent('Review queue')
    expect(nav).not.toHaveTextContent('Your reports')
    expect(nav).toHaveTextContent('(Safety reviewer)')
  })

  it('marks the current page link', async () => {
    const home = renderApp('/reporter', { as: 'reporter' })
    expect(await screen.findByRole('link', { name: 'Your reports' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    home.unmount()

    renderApp('/reporter/new', { as: 'reporter' })
    expect(await screen.findByRole('link', { name: 'Your reports' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('signs out, clears the session and returns to sign-in', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/reporter', { as: 'reporter' })
    await user.click(await screen.findByRole('button', { name: 'Sign out' }))
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/sign-in')
    expect(sessionStorage.getItem('aep.session')).toBeNull()
  })

  it('has no accessibility violations on a signed-in page', async () => {
    const { container } = renderApp('/reporter', { as: 'reporter' })
    await screen.findByRole('navigation', { name: 'Main' })
    expect(await axe(container)).toHaveNoViolations()
  })
})
