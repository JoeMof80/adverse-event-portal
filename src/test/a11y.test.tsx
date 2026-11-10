import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { saveDraft, type ReportDraft } from '@/features/report-form/draft'
import { server } from '@/mocks/server'
import { store } from '@/mocks/store'
import { axe } from './axe'
import { renderApp } from './renderApp'

/*
 * Every page, in every state a user can reach, passes axe and sets a page title.
 * Pages whose main flows already carry axe checks are covered here only in the states
 * those tests do not reach.
 */

const ALEX = 'u-reporter-1'

const completeDraft: ReportDraft = {
  stepIndex: 4,
  updatedAt: '2026-11-10T10:00:00.000Z',
  reporter: { reporterType: 'patient', name: 'Alex Morgan', email: 'alex@example.com', phone: '' },
  patient: { initials: 'AM', age: '40', dateOfBirth: '', sex: 'female' },
  medicine: {
    name: 'Ibuprofen',
    dose: '400mg',
    route: 'oral',
    startDate: '2026-10-01',
    stopDate: '',
  },
  reaction: {
    description: 'Stomach pain',
    onsetDate: '2026-10-05',
    outcome: 'recovered',
    recoveryDate: '2026-10-08',
    serious: 'yes',
    seriousnessCriteria: ['hospitalisation'],
    hospitalAdmissionDate: '2026-10-06',
    hospitalDischargeDate: '2026-10-07',
  },
}

beforeEach(() => store.reset())

describe('accessibility and titles across pages', () => {
  it('sign-in page', async () => {
    const { container } = renderApp('/sign-in')
    await screen.findByRole('heading', { level: 1, name: 'Sign in' })
    expect(document.title).toBe('Sign in - Adverse Event Reporting Portal')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('sign-in page with an error', async () => {
    const { container } = renderApp('/auth/callback?code=x&state=forged')
    await screen.findByRole('alert')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('identity provider page without a valid request', async () => {
    const { container } = renderApp('/idp/authorise')
    await screen.findByRole('heading', { level: 1, name: 'Choose an account' })
    expect(document.title).toBe('Choose an account - Adverse Event Reporting Portal')
    await screen.findByRole('alert')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('reporter home, with and without a draft', async () => {
    const first = renderApp('/reporter', { as: 'reporter' })
    await screen.findByRole('link', { name: 'Start a new report' })
    await screen.findByRole('table')
    expect(document.title).toBe('Your reports - Adverse Event Reporting Portal')
    expect(await axe(first.container)).toHaveNoViolations()
    first.unmount()

    saveDraft(ALEX, { stepIndex: 1, updatedAt: '2026-11-10T09:30:00.000Z' })
    server.use(http.get('/api/reports', () => HttpResponse.json([])))
    const second = renderApp('/reporter', { as: 'reporter' })
    await screen.findByText('You have a report in progress')
    await screen.findByText('You have not submitted any reports yet.')
    expect(await axe(second.container)).toHaveNoViolations()
  })

  it('every form step, the review step and the confirmation', async () => {
    const user = userEvent.setup()
    saveDraft(ALEX, completeDraft)
    const { container } = renderApp('/reporter/new', { as: 'reporter' })
    await screen.findByRole('heading', { level: 1, name: 'Check your answers' })
    expect(document.title).toBe('Check your answers - New report - Adverse Event Reporting Portal')
    expect(await axe(container)).toHaveNoViolations()

    for (const title of [
      'Reporter details',
      'Patient details',
      'Suspect medicine',
      'Reaction and seriousness',
    ]) {
      await user.click(screen.getByRole('button', { name: `Change ${title.toLowerCase()}` }))
      await screen.findByRole('heading', { level: 1, name: title })
      expect(document.title).toBe(`${title} - New report - Adverse Event Reporting Portal`)
      expect(await axe(container)).toHaveNoViolations()
      // Return to the review step without changing anything.
      while (!screen.queryByRole('heading', { level: 1, name: 'Check your answers' })) {
        await user.click(screen.getByRole('button', { name: 'Continue' }))
        await screen.findByRole('heading', { level: 1 })
      }
    }

    await user.click(screen.getByRole('button', { name: 'Accept and submit report' }))
    await screen.findByRole('heading', { level: 1, name: 'Report submitted' })
    expect(document.title).toBe('Report submitted - Adverse Event Reporting Portal')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('review queue, including the empty and error states', async () => {
    const first = renderApp('/review?status=', { as: 'reviewer' })
    await screen.findByRole('table')
    expect(document.title).toBe('Review queue - Adverse Event Reporting Portal')
    expect(await axe(first.container)).toHaveNoViolations()
    first.unmount()

    server.use(http.get('/api/reports', () => HttpResponse.json([])))
    const second = renderApp('/review', { as: 'reviewer' })
    await screen.findByText('Showing 0 reports')
    expect(await axe(second.container)).toHaveNoViolations()
    second.unmount()

    server.use(
      http.get('/api/reports', () =>
        HttpResponse.json({ message: 'Service unavailable' }, { status: 503 }),
      ),
    )
    const third = renderApp('/review', { as: 'reviewer' })
    await screen.findByRole('alert')
    expect(await axe(third.container)).toHaveNoViolations()
  })

  it('report detail as an admin, with the reassignment form and a closed report', async () => {
    const first = renderApp('/review/AER-0002', { as: 'admin' })
    await screen.findByLabelText('Assign to')
    await screen.findByText('Metformin 1g tablets')
    expect(document.title).toBe('Report AER-0002 - Adverse Event Reporting Portal')
    expect(await axe(first.container)).toHaveNoViolations()
    first.unmount()

    const second = renderApp('/review/AER-0001', { as: 'reviewer' })
    await screen.findByText('This report is closed. No further status changes are possible.')
    expect(await axe(second.container)).toHaveNoViolations()
  })

  it('page not found', async () => {
    const { container } = renderApp('/no-such-page', { as: 'reporter' })
    await screen.findByRole('heading', { level: 1, name: 'Page not found' })
    expect(document.title).toBe('Page not found - Adverse Event Reporting Portal')
    expect(await axe(container)).toHaveNoViolations()
  })
})
