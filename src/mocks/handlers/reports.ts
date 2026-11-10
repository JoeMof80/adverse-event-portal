import { http, HttpResponse } from 'msw'
import type { User } from '@/auth/types'
import {
  isReportStatus,
  STATUS_TRANSITIONS,
  toSummary,
  type AuditAction,
  type AuditEvent,
  type Report,
  type ReportStatus,
  type ReportSubmission,
  type ReviewNote,
} from '@/domain/report'
import { findUser, users } from '@/mocks/users'
import { store } from '@/mocks/store'
import { authenticate, forbiddenUnless, REVIEW_ROLES } from './auth'

/** Every mutating handler calls this, so the audit trail cannot be skipped. */
function recordAudit(
  reportId: string,
  actor: User,
  action: AuditAction,
  extra: Partial<Pick<AuditEvent, 'before' | 'after' | 'detail'>> = {},
): void {
  store.addAudit({
    id: crypto.randomUUID(),
    reportId,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action,
    at: new Date().toISOString(),
    ...extra,
  })
}

function notFound() {
  return HttpResponse.json({ message: 'Report not found' }, { status: 404 })
}

/** Reporters may only see their own reports; a report they do not own looks like it does not exist. */
function visibleReport(id: string, user: User): Report | undefined {
  const report = store.getReport(id)
  if (!report) return undefined
  if (user.role === 'reporter' && report.reporterId !== user.id) return undefined
  return report
}

function isSubmission(body: unknown): body is ReportSubmission {
  if (!body || typeof body !== 'object') return false
  const candidate = body as Record<string, unknown>
  return ['reporter', 'patient', 'medicine', 'reaction'].every(
    (section) => typeof candidate[section] === 'object' && candidate[section] !== null,
  )
}

export const reportHandlers = [
  http.get('/api/reports', ({ request }) => {
    const user = authenticate(request)
    if (user instanceof Response) return user

    const url = new URL(request.url)
    const statuses = url.searchParams.getAll('status').filter(isReportStatus)
    const order = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc'

    const reports = store
      .listReports()
      .filter((report) => user.role !== 'reporter' || report.reporterId === user.id)
      .filter((report) => statuses.length === 0 || statuses.includes(report.status))
      .sort((a, b) =>
        order === 'asc'
          ? a.submittedAt.localeCompare(b.submittedAt)
          : b.submittedAt.localeCompare(a.submittedAt),
      )

    return HttpResponse.json(reports.map(toSummary))
  }),

  http.get('/api/reports/:id', ({ request, params }) => {
    const user = authenticate(request)
    if (user instanceof Response) return user
    const report = visibleReport(String(params.id), user)
    return report ? HttpResponse.json(report) : notFound()
  }),

  http.post('/api/reports', async ({ request }) => {
    const user = authenticate(request)
    if (user instanceof Response) return user
    const forbidden = forbiddenUnless(user, ['reporter'])
    if (forbidden) return forbidden

    const body: unknown = await request.json()
    if (!isSubmission(body)) {
      return HttpResponse.json({ message: 'The report is incomplete' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const report: Report = {
      ...body,
      id: store.nextReference(),
      status: 'submitted',
      reporterId: user.id,
      reporterName: user.name,
      submittedAt: now,
      updatedAt: now,
      assignedReviewerId: null,
      assignedReviewerName: null,
      notes: [],
    }
    store.insertReport(report)
    recordAudit(report.id, user, 'submitted')
    return HttpResponse.json(report, { status: 201 })
  }),

  http.post('/api/reports/:id/status', async ({ request, params }) => {
    const user = authenticate(request)
    if (user instanceof Response) return user
    const forbidden = forbiddenUnless(user, REVIEW_ROLES)
    if (forbidden) return forbidden

    const report = store.getReport(String(params.id))
    if (!report) return notFound()

    const body = (await request.json()) as { status?: unknown }
    if (!isReportStatus(body.status)) {
      return HttpResponse.json({ message: 'Unknown status' }, { status: 400 })
    }
    const next: ReportStatus = body.status
    if (!STATUS_TRANSITIONS[report.status].includes(next)) {
      return HttpResponse.json(
        { message: `A report cannot move from ${report.status} to ${next}` },
        { status: 400 },
      )
    }

    const patch: Partial<Report> = { status: next }
    // Taking a report into review assigns it to the reviewer doing so, unless already assigned.
    if (next === 'under-review' && !report.assignedReviewerId) {
      patch.assignedReviewerId = user.id
      patch.assignedReviewerName = user.name
    }
    const updated = store.updateReport(report.id, patch)!
    recordAudit(report.id, user, 'status-changed', { before: report.status, after: next })
    return HttpResponse.json(updated)
  }),

  http.post('/api/reports/:id/notes', async ({ request, params }) => {
    const user = authenticate(request)
    if (user instanceof Response) return user
    const forbidden = forbiddenUnless(user, REVIEW_ROLES)
    if (forbidden) return forbidden

    const report = store.getReport(String(params.id))
    if (!report) return notFound()

    const body = (await request.json()) as { body?: unknown }
    const text = typeof body.body === 'string' ? body.body.trim() : ''
    if (!text) {
      return HttpResponse.json({ message: 'Enter a note' }, { status: 400 })
    }

    const note: ReviewNote = {
      id: crypto.randomUUID(),
      reportId: report.id,
      authorId: user.id,
      authorName: user.name,
      body: text,
      createdAt: new Date().toISOString(),
    }
    store.addNote(note)
    recordAudit(report.id, user, 'note-added', { detail: text })
    return HttpResponse.json(note, { status: 201 })
  }),

  http.post('/api/reports/:id/assignee', async ({ request, params }) => {
    const user = authenticate(request)
    if (user instanceof Response) return user
    const forbidden = forbiddenUnless(user, ['admin'])
    if (forbidden) return forbidden

    const report = store.getReport(String(params.id))
    if (!report) return notFound()

    const body = (await request.json()) as { reviewerId?: unknown }
    const reviewer = typeof body.reviewerId === 'string' ? findUser(body.reviewerId) : undefined
    if (!reviewer || !REVIEW_ROLES.includes(reviewer.role)) {
      return HttpResponse.json({ message: 'Choose a reviewer' }, { status: 400 })
    }

    const updated = store.updateReport(report.id, {
      assignedReviewerId: reviewer.id,
      assignedReviewerName: reviewer.name,
    })!
    recordAudit(report.id, user, 'reassigned', {
      before: report.assignedReviewerName ?? 'Unassigned',
      after: reviewer.name,
    })
    return HttpResponse.json(updated)
  }),

  http.get('/api/reports/:id/audit', ({ request, params }) => {
    const user = authenticate(request)
    if (user instanceof Response) return user
    const report = visibleReport(String(params.id), user)
    if (!report) return notFound()
    const events = store.listAudit(report.id).sort((a, b) => b.at.localeCompare(a.at))
    return HttpResponse.json(events)
  }),

  http.get('/api/reviewers', ({ request }) => {
    const user = authenticate(request)
    if (user instanceof Response) return user
    const forbidden = forbiddenUnless(user, REVIEW_ROLES)
    if (forbidden) return forbidden
    return HttpResponse.json(users.filter((user) => REVIEW_ROLES.includes(user.role)))
  }),
]
