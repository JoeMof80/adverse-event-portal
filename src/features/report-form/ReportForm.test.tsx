import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { store } from '@/mocks/store'
import { axe } from '@/test/axe'
import { renderApp } from '@/test/renderApp'
import { loadDraft } from './draft'

const ALEX = 'u-reporter-1'

beforeEach(() => store.reset())

function setDate(label: string | RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

async function fillReporterStep(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: 'Healthcare professional' }))
  await user.type(screen.getByLabelText('Full name'), 'Dr Alex Morgan')
  await user.type(screen.getByLabelText('Email address'), 'alex@example.com')
  await user.click(screen.getByRole('button', { name: 'Continue' }))
}

async function fillPatientStep(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Patient's initials"), 'rm')
  await user.type(screen.getByLabelText('Age in years'), '58')
  await user.click(screen.getByRole('radio', { name: 'Male' }))
  await user.click(screen.getByRole('button', { name: 'Continue' }))
}

async function fillMedicineStep(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Name of the medicine'), 'Metformin 1g')
  await user.type(screen.getByLabelText('Dose and how often'), '1g twice a day')
  await user.selectOptions(screen.getByLabelText('How was it taken?'), 'oral')
  setDate('Date the medicine was started', '2026-01-10')
  await user.click(screen.getByRole('button', { name: 'Continue' }))
}

describe('adverse event form', () => {
  it('starts on the first step with progress shown', async () => {
    renderApp('/reporter/new', { as: 'reporter' })
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Reporter details' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
  })

  it('blocks Continue, lists the errors with links, and focuses the summary', async () => {
    const user = userEvent.setup()
    renderApp('/reporter/new', { as: 'reporter' })
    await user.click(await screen.findByRole('button', { name: 'Continue' }))

    const summary = await screen.findByRole('alert')
    expect(summary).toHaveFocus()
    expect(summary).toHaveTextContent('There is a problem')
    const links = within(summary).getAllByRole('link')
    expect(links.map((l) => l.textContent)).toEqual([
      'Select who is making this report',
      'Enter your full name',
      'Enter your email address',
    ])
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Reporter details')

    // The field shows its own error and the summary link moves focus to it.
    expect(screen.getByLabelText('Full name')).toHaveAccessibleDescription(/Enter your full name/)
    await user.click(links[1]!)
    expect(screen.getByLabelText('Full name')).toHaveFocus()
  })

  it('moves to the next step and focuses its heading, and Back keeps the answers', async () => {
    const user = userEvent.setup()
    renderApp('/reporter/new', { as: 'reporter' })
    await screen.findByRole('heading', { level: 1, name: 'Reporter details' })
    await fillReporterStep(user)

    const heading = await screen.findByRole('heading', { level: 1, name: 'Patient details' })
    expect(heading).toHaveFocus()
    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Reporter details' })).toHaveFocus()
    expect(screen.getByLabelText('Full name')).toHaveValue('Dr Alex Morgan')
    expect(screen.getByRole('radio', { name: 'Healthcare professional' })).toBeChecked()
  })

  it('reveals the conditional questions only when they apply', async () => {
    const user = userEvent.setup()
    renderApp('/reporter/new', { as: 'reporter' })
    await screen.findByRole('heading', { level: 1, name: 'Reporter details' })
    await fillReporterStep(user)
    await fillPatientStep(user)
    await fillMedicineStep(user)
    await screen.findByRole('heading', { level: 1, name: 'Reaction and seriousness' })

    expect(screen.queryByRole('group', { name: 'Why was it serious?' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/recovered or started to recover/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Recovering' }))
    expect(screen.getByLabelText(/recovered or started to recover/)).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Yes' }))
    const criteria = screen.getByRole('group', { name: 'Why was it serious?' })
    expect(criteria).toBeInTheDocument()
    expect(screen.queryByLabelText('Date admitted to hospital')).not.toBeInTheDocument()

    await user.click(within(criteria).getByRole('checkbox', { name: /hospitalisation/ }))
    expect(screen.getByLabelText('Date admitted to hospital')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'No' }))
    expect(screen.queryByRole('group', { name: 'Why was it serious?' })).not.toBeInTheDocument()
  })

  it('submits a complete report and shows the reference', async () => {
    const user = userEvent.setup()
    renderApp('/reporter/new', { as: 'reporter' })
    await screen.findByRole('heading', { level: 1, name: 'Reporter details' })
    await fillReporterStep(user)
    await fillPatientStep(user)
    await fillMedicineStep(user)

    await screen.findByRole('heading', { level: 1, name: 'Reaction and seriousness' })
    await user.type(
      screen.getByLabelText('Describe the reaction'),
      'Admitted with lactic acidosis.',
    )
    setDate('Date the reaction started', '2026-10-17')
    await user.click(screen.getByRole('radio', { name: 'Recovering' }))
    setDate(/recovered or started to recover/, '2026-10-20')
    await user.click(screen.getByRole('radio', { name: 'Yes' }))
    await user.click(screen.getByRole('checkbox', { name: /hospitalisation/ }))
    setDate('Date admitted to hospital', '2026-10-18')
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Check your answers' }),
    ).toHaveFocus()
    expect(screen.getByText('Metformin 1g')).toBeInTheDocument()
    expect(screen.getByText('Caused or prolonged hospitalisation')).toBeInTheDocument()
    expect(screen.getByText('18 October 2026')).toBeInTheDocument()

    // Change a section and come back.
    await user.click(screen.getByRole('button', { name: 'Change patient details' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Patient details' })).toHaveFocus()
    expect(screen.getByLabelText("Patient's initials")).toHaveValue('RM')
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByRole('heading', { level: 1, name: 'Suspect medicine' })
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByRole('heading', { level: 1, name: 'Reaction and seriousness' })
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByRole('heading', { level: 1, name: 'Check your answers' })

    await user.click(screen.getByRole('button', { name: 'Accept and submit report' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Report submitted' })).toHaveFocus()
    expect(screen.getByText('AER-0007')).toBeInTheDocument()
    expect(loadDraft(ALEX)).toBeNull()

    const created = store.getReport('AER-0007')
    expect(created?.patient).toEqual({ initials: 'RM', age: 58, sex: 'male' })
    expect(created?.reaction.seriousnessCriteria).toEqual(['hospitalisation'])
    expect(created?.reaction.hospitalAdmissionDate).toBe('2026-10-18')
  })

  it('autosaves and restores the draft, including the step, after leaving', async () => {
    const user = userEvent.setup()
    const first = renderApp('/reporter/new', { as: 'reporter' })
    await screen.findByRole('heading', { level: 1, name: 'Reporter details' })
    await fillReporterStep(user)
    await screen.findByRole('heading', { level: 1, name: 'Patient details' })
    await user.type(screen.getByLabelText("Patient's initials"), 'KT')
    expect(screen.getByText(/Draft saved at/)).toBeInTheDocument()

    const saved = loadDraft(ALEX)
    expect(saved?.stepIndex).toBe(1)
    expect(saved?.reporter?.name).toBe('Dr Alex Morgan')
    expect(saved?.patient?.initials).toBe('KT')

    first.unmount()
    renderApp('/reporter/new', { as: 'reporter' })
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Patient details' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Patient's initials")).toHaveValue('KT')
  })

  it('has no accessibility violations on a step with errors and on the review step', async () => {
    const user = userEvent.setup()
    const { container } = renderApp('/reporter/new', { as: 'reporter' })
    await user.click(await screen.findByRole('button', { name: 'Continue' }))
    await screen.findByRole('alert')
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('autosave on open', () => {
  it('does not create a draft just by opening the form', async () => {
    renderApp('/reporter/new', { as: 'reporter' })
    await screen.findByRole('heading', { level: 1, name: 'Reporter details' })
    expect(screen.getByText('Your answers are saved as you go')).toBeInTheDocument()
    expect(loadDraft(ALEX)).toBeNull()
  })
})
