import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { axe } from '@/test/axe'
import { renderApp } from '@/test/renderApp'
import { loadSession } from './session'

describe('sign-in flow', () => {
  it('signs in as a reviewer through the identity provider and lands on the review queue', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/review')

    await user.click(await screen.findByRole('button', { name: 'Sign in with single sign-on' }))
    expect(await screen.findByRole('heading', { name: 'Choose an account' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/idp/authorise')
    expect(router.state.location.search).toContain('response_type=code')

    await user.click(await screen.findByRole('button', { name: /Jordan Lee/ }))

    expect(await screen.findByRole('heading', { name: 'Review queue' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/review')
    expect(screen.getByRole('navigation', { name: 'Main' })).toHaveTextContent(
      'Signed in as Jordan Lee (Safety reviewer)',
    )
    expect(loadSession()?.user.role).toBe('reviewer')
  })

  it('returns a reporter to the page they first asked for', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/reporter/new')

    await user.click(await screen.findByRole('button', { name: 'Sign in with single sign-on' }))
    await user.click(await screen.findByRole('button', { name: /Alex Morgan/ }))

    expect(
      await screen.findByRole('heading', { name: 'New adverse event report' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/reporter/new')
  })

  it('rejects a callback whose state does not match this browser session', async () => {
    const { router } = renderApp('/auth/callback?code=code-123&state=forged')
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('did not match this browser session')
    expect(router.state.location.pathname).toBe('/sign-in')
    expect(loadSession()).toBeNull()
  })

  it('shows an error when the token endpoint rejects the code', async () => {
    server.use(
      http.post('/api/oidc/token', () =>
        HttpResponse.json({ message: 'The sign-in code has expired.' }, { status: 400 }),
      ),
    )
    const user = userEvent.setup()
    renderApp('/sign-in')
    await user.click(await screen.findByRole('button', { name: 'Sign in with single sign-on' }))
    await user.click(await screen.findByRole('button', { name: /Sam Patel/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent('The sign-in code has expired.')
    expect(loadSession()).toBeNull()
  })

  it('has no accessibility violations on the sign-in and account pages', async () => {
    const user = userEvent.setup()
    const { container } = renderApp('/sign-in')
    await screen.findByRole('heading', { name: 'Sign in' })
    expect(await axe(container)).toHaveNoViolations()

    await user.click(screen.getByRole('button', { name: 'Sign in with single sign-on' }))
    await screen.findByRole('button', { name: /Jordan Lee/ })
    expect(await axe(container)).toHaveNoViolations()
  })
})
