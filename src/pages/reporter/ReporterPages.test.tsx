import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { saveDraft, loadDraft } from '@/features/report-form/draft'
import { server } from '@/mocks/server'
import { store } from '@/mocks/store'
import { axe } from '@/test/axe'
import { renderApp } from '@/test/renderApp'

const ALEX = 'u-reporter-1'

beforeEach(() => store.reset())

describe('reporter home', () => {
  it('offers to start a report when there is no draft', async () => {
    renderApp('/reporter', { as: 'reporter' })
    expect(await screen.findByRole('link', { name: 'Start a new report' })).toHaveAttribute(
      'href',
      '/reporter/new',
    )
    expect(screen.queryByText('You have a report in progress')).not.toBeInTheDocument()
    expect(document.title).toBe('Your reports - Adverse Event Reporting Portal')
  })

  it('offers to continue or discard a draft in progress', async () => {
    const user = userEvent.setup()
    saveDraft(ALEX, {
      stepIndex: 2,
      updatedAt: '2026-11-10T09:30:00.000Z',
      reporter: { name: 'Dr Alex Morgan' },
    })
    const { router } = renderApp('/reporter', { as: 'reporter' })
    expect(await screen.findByText('You have a report in progress')).toBeInTheDocument()
    expect(screen.getByText(/Suspect medicine/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Continue your report' })).toHaveAttribute(
      'href',
      '/reporter/new',
    )

    await user.click(screen.getByRole('button', { name: 'Start a new report instead' }))
    expect(loadDraft(ALEX)).toBeNull()
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Reporter details' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/reporter/new')
  })
})

describe('submitted reports on the home page', () => {
  it("lists only the signed-in reporter's reports with their status", async () => {
    const { container } = renderApp('/reporter', { as: 'reporter' })
    const rows = await screen.findAllByRole('row')
    expect(rows).toHaveLength(4)
    expect(screen.getByRole('rowheader', { name: 'AER-0003' })).toBeInTheDocument()
    expect(screen.queryByText('AER-0004')).not.toBeInTheDocument()
    expect(screen.getByText('Under review')).toBeInTheDocument()
    expect(screen.getByText('Closed')).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('says so when there are none', async () => {
    server.use(http.get('/api/reports', () => HttpResponse.json([])))
    renderApp('/reporter', { as: 'reporter' })
    expect(await screen.findByText('You have not submitted any reports yet.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
