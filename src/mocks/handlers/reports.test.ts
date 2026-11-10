import type { AuditEvent, Report, ReportSubmission, ReportSummary } from '@/domain/report'
import { store } from '@/mocks/store'
import { call } from '@/test/api'

const ALEX = 'u-reporter-1'
const PRIYA = 'u-reporter-2'
const JORDAN = 'u-reviewer-1'
const CHRIS = 'u-reviewer-2'
const SAM = 'u-admin-1'

const submission: ReportSubmission = {
  reporter: { reporterType: 'patient', name: 'Dr Alex Morgan', email: 'alex@example.com' },
  patient: { initials: 'AB', age: 50, sex: 'female' },
  medicine: { name: 'Ramipril 5mg', dose: '5mg daily', route: 'oral', startDate: '2026-10-01' },
  reaction: {
    description: 'Dry persistent cough',
    onsetDate: '2026-10-15',
    outcome: 'not-recovered',
    serious: false,
  },
}

beforeEach(() => store.reset())

describe('GET /api/reports', () => {
  it('requires a signed-in user', async () => {
    const { status } = await call('/api/reports')
    expect(status).toBe(401)
  })

  it('shows a reviewer every report, newest first by default', async () => {
    const { status, data } = await call<ReportSummary[]>('/api/reports', { as: JORDAN })
    expect(status).toBe(200)
    expect(data.map((r) => r.id)).toEqual([
      'AER-0005',
      'AER-0003',
      'AER-0004',
      'AER-0002',
      'AER-0006',
      'AER-0001',
    ])
  })

  it('filters by one or more statuses', async () => {
    const { data } = await call<ReportSummary[]>(
      '/api/reports?status=submitted&status=under-review',
      { as: JORDAN },
    )
    expect(data.map((r) => r.id)).toEqual(['AER-0005', 'AER-0003', 'AER-0004', 'AER-0002'])
    expect(data.every((r) => r.status !== 'closed')).toBe(true)
  })

  it('sorts oldest first when asked', async () => {
    const { data } = await call<ReportSummary[]>('/api/reports?order=asc', { as: JORDAN })
    expect(data[0]?.id).toBe('AER-0001')
    expect(data.at(-1)?.id).toBe('AER-0005')
  })

  it('shows a reporter only their own reports', async () => {
    const { data } = await call<ReportSummary[]>('/api/reports', { as: ALEX })
    expect(data.map((r) => r.id).sort()).toEqual(['AER-0001', 'AER-0002', 'AER-0003'])
  })

  it('returns the list row shape', async () => {
    const { data } = await call<ReportSummary[]>('/api/reports?status=under-review', {
      as: SAM,
    })
    expect(data.find((r) => r.id === 'AER-0004')).toEqual({
      id: 'AER-0004',
      status: 'under-review',
      submittedAt: '2026-10-29T08:55:00.000Z',
      updatedAt: '2026-11-03T09:30:00.000Z',
      reporterName: 'Priya Shah',
      patientInitials: 'KT',
      medicineName: 'Phenoxymethylpenicillin 500mg tablets',
      serious: true,
      assignedReviewerName: 'Jordan Lee',
    })
  })
})

describe('GET /api/reports/:id', () => {
  it('returns the full report with notes to a reviewer', async () => {
    const { status, data } = await call<Report>('/api/reports/AER-0002', { as: CHRIS })
    expect(status).toBe(200)
    expect(data.reaction.seriousnessCriteria).toEqual(['hospitalisation', 'life-threatening'])
    expect(data.notes).toHaveLength(1)
  })

  it("hides another reporter's report as not found", async () => {
    const { status } = await call('/api/reports/AER-0004', { as: ALEX })
    expect(status).toBe(404)
  })

  it('returns 404 for an unknown reference', async () => {
    const { status } = await call('/api/reports/AER-9999', { as: JORDAN })
    expect(status).toBe(404)
  })
})

describe('POST /api/reports', () => {
  it('creates a submitted report with the next reference and records the audit event', async () => {
    const { status, data } = await call<Report>('/api/reports', {
      as: PRIYA,
      method: 'POST',
      body: submission,
    })
    expect(status).toBe(201)
    expect(data.id).toBe('AER-0007')
    expect(data.status).toBe('submitted')
    expect(data.reporterId).toBe(PRIYA)
    expect(data.reporterName).toBe('Priya Shah')
    expect(data.assignedReviewerId).toBeNull()

    const audit = await call<AuditEvent[]>('/api/reports/AER-0007/audit', { as: PRIYA })
    expect(audit.data).toHaveLength(1)
    expect(audit.data[0]).toMatchObject({
      action: 'submitted',
      actorId: PRIYA,
      actorRole: 'reporter',
    })
  })

  it('refuses reviewers', async () => {
    const { status } = await call('/api/reports', { as: JORDAN, method: 'POST', body: submission })
    expect(status).toBe(403)
  })

  it('rejects an incomplete report', async () => {
    const { status } = await call('/api/reports', {
      as: ALEX,
      method: 'POST',
      body: { reporter: submission.reporter },
    })
    expect(status).toBe(400)
  })
})

describe('POST /api/reports/:id/status', () => {
  it('moves a submitted report into review, assigns the reviewer and audits before and after', async () => {
    const { status, data } = await call<Report>('/api/reports/AER-0003/status', {
      as: JORDAN,
      method: 'POST',
      body: { status: 'under-review' },
    })
    expect(status).toBe(200)
    expect(data.status).toBe('under-review')
    expect(data.assignedReviewerName).toBe('Jordan Lee')

    const audit = await call<AuditEvent[]>('/api/reports/AER-0003/audit', { as: JORDAN })
    expect(audit.data[0]).toMatchObject({
      action: 'status-changed',
      before: 'submitted',
      after: 'under-review',
      actorName: 'Jordan Lee',
    })
  })

  it('keeps the existing reviewer when a different reviewer closes a report', async () => {
    const { data } = await call<Report>('/api/reports/AER-0004/status', {
      as: CHRIS,
      method: 'POST',
      body: { status: 'closed' },
    })
    expect(data.status).toBe('closed')
    expect(data.assignedReviewerName).toBe('Jordan Lee')
  })

  it('rejects a transition the lifecycle does not allow', async () => {
    const { status, data } = await call<{ message: string }>('/api/reports/AER-0003/status', {
      as: JORDAN,
      method: 'POST',
      body: { status: 'closed' },
    })
    expect(status).toBe(400)
    expect(data.message).toBe('A report cannot move from submitted to closed')
  })

  it('refuses reporters', async () => {
    const { status } = await call('/api/reports/AER-0003/status', {
      as: ALEX,
      method: 'POST',
      body: { status: 'under-review' },
    })
    expect(status).toBe(403)
  })
})

describe('POST /api/reports/:id/notes', () => {
  it('adds a note to the report and audits it', async () => {
    const { status, data } = await call<{ id: string; body: string }>(
      '/api/reports/AER-0003/notes',
      {
        as: CHRIS,
        method: 'POST',
        body: { body: '  Requested further details.  ' },
      },
    )
    expect(status).toBe(201)
    expect(data.body).toBe('Requested further details.')

    const report = await call<Report>('/api/reports/AER-0003', { as: CHRIS })
    expect(report.data.notes.map((n) => n.body)).toEqual(['Requested further details.'])

    const audit = await call<AuditEvent[]>('/api/reports/AER-0003/audit', { as: CHRIS })
    expect(audit.data[0]).toMatchObject({
      action: 'note-added',
      detail: 'Requested further details.',
    })
  })

  it('rejects an empty note', async () => {
    const { status } = await call('/api/reports/AER-0003/notes', {
      as: CHRIS,
      method: 'POST',
      body: { body: '   ' },
    })
    expect(status).toBe(400)
  })
})

describe('POST /api/reports/:id/assignee', () => {
  it('lets an admin reassign a report and audits the change', async () => {
    const { status, data } = await call<Report>('/api/reports/AER-0002/assignee', {
      as: SAM,
      method: 'POST',
      body: { reviewerId: JORDAN },
    })
    expect(status).toBe(200)
    expect(data.assignedReviewerName).toBe('Jordan Lee')

    const audit = await call<AuditEvent[]>('/api/reports/AER-0002/audit', { as: SAM })
    expect(audit.data[0]).toMatchObject({
      action: 'reassigned',
      before: 'Chris Okafor',
      after: 'Jordan Lee',
      actorRole: 'admin',
    })
  })

  it('refuses reviewers', async () => {
    const { status } = await call('/api/reports/AER-0002/assignee', {
      as: JORDAN,
      method: 'POST',
      body: { reviewerId: JORDAN },
    })
    expect(status).toBe(403)
  })

  it('rejects someone who is not a reviewer', async () => {
    const { status } = await call('/api/reports/AER-0002/assignee', {
      as: SAM,
      method: 'POST',
      body: { reviewerId: ALEX },
    })
    expect(status).toBe(400)
  })
})

describe('GET /api/reports/:id/audit', () => {
  it('lists events newest first', async () => {
    const { data } = await call<AuditEvent[]>('/api/reports/AER-0001/audit', { as: JORDAN })
    expect(data.map((e) => e.action)).toEqual([
      'status-changed',
      'note-added',
      'status-changed',
      'submitted',
    ])
  })

  it('lets a reporter see the audit trail of their own report only', async () => {
    const own = await call<AuditEvent[]>('/api/reports/AER-0001/audit', { as: ALEX })
    expect(own.status).toBe(200)
    const other = await call('/api/reports/AER-0004/audit', { as: ALEX })
    expect(other.status).toBe(404)
  })
})

describe('GET /api/reviewers', () => {
  it('lists reviewers and admins for assignment', async () => {
    const { data } = await call<{ name: string }[]>('/api/reviewers', { as: SAM })
    expect(data.map((u) => u.name)).toEqual(['Jordan Lee', 'Chris Okafor', 'Sam Patel'])
  })

  it('refuses reporters', async () => {
    const { status } = await call('/api/reviewers', { as: ALEX })
    expect(status).toBe(403)
  })
})

describe('store persistence', () => {
  it('survives a reload by persisting to localStorage', async () => {
    await call('/api/reports', { as: ALEX, method: 'POST', body: submission })
    expect(JSON.parse(localStorage.getItem('aep.db')!).reports).toHaveLength(7)
  })
})
