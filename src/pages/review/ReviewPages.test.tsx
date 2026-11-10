import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { store } from '@/mocks/store'
import { axe } from '@/test/axe'
import { renderApp } from '@/test/renderApp'

beforeEach(() => store.reset())

/** The value shown next to a label in a summary list. */
function summaryValue(label: string) {
  return screen.getByText(label, { selector: 'dt' }).nextElementSibling?.textContent
}

function rowReferences() {
  return screen.getAllByRole('rowheader').map((cell) => cell.textContent)
}

describe('review queue', () => {
  it('shows submitted and under-review reports, newest first, by default', async () => {
    renderApp('/review', { as: 'reviewer' })
    await screen.findByRole('table')
    expect(rowReferences()).toEqual(['AER-0005', 'AER-0003', 'AER-0004', 'AER-0002'])
    expect(screen.getByRole('status')).toHaveTextContent('Showing 4 reports')
    expect(screen.getByRole('checkbox', { name: 'Submitted' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Under review' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Closed' })).not.toBeChecked()
  })

  it('filters by status and keeps the filter in the URL', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/review', { as: 'reviewer' })
    await screen.findByRole('table')

    await user.click(screen.getByRole('checkbox', { name: 'Closed' }))
    await waitFor(() => expect(rowReferences()).toHaveLength(6))
    expect(router.state.location.search).toContain('status=closed')

    await user.click(screen.getByRole('checkbox', { name: 'Submitted' }))
    await user.click(screen.getByRole('checkbox', { name: 'Under review' }))
    await waitFor(() => expect(rowReferences()).toEqual(['AER-0006', 'AER-0001']))
  })

  it('sorts oldest first when asked', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/review', { as: 'reviewer' })
    await screen.findByRole('table')
    await user.selectOptions(screen.getByLabelText('Sort by'), 'asc')
    await waitFor(() =>
      expect(rowReferences()).toEqual(['AER-0002', 'AER-0004', 'AER-0003', 'AER-0005']),
    )
    expect(router.state.location.search).toContain('order=asc')
  })

  it('reads filters from the URL on load', async () => {
    renderApp('/review?status=closed&order=asc', { as: 'admin' })
    await screen.findByRole('table')
    expect(rowReferences()).toEqual(['AER-0001', 'AER-0006'])
  })

  it('shows seriousness, reporter and assignment, and links to the detail page', async () => {
    renderApp('/review', { as: 'reviewer' })
    await screen.findByRole('table')
    const row = screen.getByRole('rowheader', { name: 'AER-0004' }).closest('tr')!
    expect(within(row).getByText('Yes')).toBeInTheDocument()
    expect(within(row).getByText('Priya Shah')).toBeInTheDocument()
    expect(within(row).getByText('Jordan Lee')).toBeInTheDocument()
    expect(within(row).getByRole('link', { name: 'AER-0004' })).toHaveAttribute(
      'href',
      '/review/AER-0004',
    )
    const unassigned = screen.getByRole('rowheader', { name: 'AER-0003' }).closest('tr')!
    expect(within(unassigned).getByText('Unassigned')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = renderApp('/review', { as: 'reviewer' })
    await screen.findByRole('table')
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('report detail', () => {
  it('shows every answer, the notes and the history newest first', async () => {
    const { container } = renderApp('/review/AER-0002', { as: 'reviewer' })
    expect(await screen.findByText('Metformin 1g tablets')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Report AER-0002' })).toBeInTheDocument()
    expect(summaryValue('Assigned to')).toBe('Chris Okafor')
    expect(
      screen.getByText('Caused or prolonged hospitalisation, Life-threatening'),
    ).toBeInTheDocument()
    expect(screen.getByText('18 October 2026')).toBeInTheDocument()

    const notes = screen.getByRole('region', { name: 'Review notes' })
    expect(within(notes).getByText(/Requesting renal function results/)).toBeInTheDocument()

    const history = screen.getByRole('region', { name: 'History' })
    const items = await within(history).findAllByRole('listitem')
    expect(items.map((item) => item.querySelector('p')?.textContent)).toEqual([
      'Review note added',
      'Status changed',
      'Report submitted',
    ])
    expect(items[1]).toHaveTextContent('Submitted to Under review')
    expect(items[1]).toHaveTextContent('Chris Okafor (Safety reviewer)')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('shows an error for a report that does not exist', async () => {
    renderApp('/review/AER-9999', { as: 'reviewer' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Report not found')
  })
})

describe('status actions', () => {
  it('offers only the transitions the lifecycle allows', async () => {
    renderApp('/review/AER-0003', { as: 'reviewer' })
    const actions = await screen.findByRole('region', { name: 'Actions' })
    expect(within(actions).getByRole('button', { name: 'Start review' })).toBeInTheDocument()
    expect(within(actions).queryByRole('button', { name: 'Close report' })).not.toBeInTheDocument()
  })

  it('shows Close for a report under review and nothing for a closed one', async () => {
    const underReview = renderApp('/review/AER-0002', { as: 'reviewer' })
    const actions = await screen.findByRole('region', { name: 'Actions' })
    expect(within(actions).getByRole('button', { name: 'Close report' })).toBeInTheDocument()
    expect(within(actions).queryByRole('button', { name: 'Start review' })).not.toBeInTheDocument()
    underReview.unmount()

    renderApp('/review/AER-0001', { as: 'reviewer' })
    const closedActions = await screen.findByRole('region', { name: 'Actions' })
    expect(within(closedActions).queryAllByRole('button')).toHaveLength(0)
    expect(closedActions).toHaveTextContent('This report is closed')
  })

  it('starts a review: status, assignment and history all update', async () => {
    const user = userEvent.setup()
    renderApp('/review/AER-0003', { as: 'reviewer' })
    await user.click(await screen.findByRole('button', { name: 'Start review' }))

    expect(await screen.findByText('Status changed to Under review.')).toBeInTheDocument()
    await waitFor(() => expect(summaryValue('Assigned to')).toBe('Jordan Lee'))
    const history = screen.getByRole('region', { name: 'History' })
    await waitFor(() =>
      expect(within(history).getAllByRole('listitem')[0]).toHaveTextContent(
        'Submitted to Under review',
      ),
    )
    expect(screen.getByRole('button', { name: 'Close report' })).toBeInTheDocument()
  })
})

describe('review notes', () => {
  it('adds a note and records it in the history', async () => {
    const user = userEvent.setup()
    renderApp('/review/AER-0003', { as: 'reviewer' })

    await user.click(await screen.findByRole('button', { name: 'Add note' }))
    expect(screen.getByLabelText('Add a note')).toHaveAccessibleDescription(/Enter a note/)

    await user.type(screen.getByLabelText('Add a note'), 'Requested CK trend from the GP.')
    await user.click(screen.getByRole('button', { name: 'Add note' }))

    const notes = screen.getByRole('region', { name: 'Review notes' })
    expect(await within(notes).findByText('Requested CK trend from the GP.')).toBeInTheDocument()
    expect(within(notes).getByText(/Jordan Lee/)).toBeInTheDocument()
    expect(screen.getByLabelText('Add a note')).toHaveValue('')
    const history = screen.getByRole('region', { name: 'History' })
    await waitFor(() =>
      expect(within(history).getAllByRole('listitem')[0]).toHaveTextContent('Review note added'),
    )
  })
})

describe('reassignment', () => {
  it('is hidden from reviewers', async () => {
    renderApp('/review/AER-0002', { as: 'reviewer' })
    await screen.findByRole('region', { name: 'Actions' })
    expect(screen.queryByRole('button', { name: 'Reassign report' })).not.toBeInTheDocument()
  })

  it('lets an admin reassign to another reviewer', async () => {
    const user = userEvent.setup()
    renderApp('/review/AER-0002', { as: 'admin' })
    const select = await screen.findByLabelText('Assign to')
    await waitFor(() => expect(within(select).getAllByRole('option').length).toBeGreaterThan(1))
    expect(within(select).queryByRole('option', { name: 'Chris Okafor' })).not.toBeInTheDocument()

    await user.selectOptions(select, 'u-reviewer-1')
    await user.click(screen.getByRole('button', { name: 'Reassign report' }))

    expect(await screen.findByText('Reassigned to Jordan Lee.')).toBeInTheDocument()
    const history = screen.getByRole('region', { name: 'History' })
    await waitFor(() =>
      expect(within(history).getAllByRole('listitem')[0]).toHaveTextContent(
        'Chris Okafor to Jordan Lee',
      ),
    )
  })
})
