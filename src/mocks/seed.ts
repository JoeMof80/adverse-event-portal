import type { AuditEvent, Report } from '@/domain/report'

/*
 * Six reports in mixed statuses with realistic audit history, so the review queue, filters,
 * sorting and audit trail can be shown before anyone submits a report.
 */

const alex = { id: 'u-reporter-1', name: 'Dr Alex Morgan' }
const priya = { id: 'u-reporter-2', name: 'Priya Shah' }
const jordan = { id: 'u-reviewer-1', name: 'Jordan Lee' }
const chris = { id: 'u-reviewer-2', name: 'Chris Okafor' }
const sam = { id: 'u-admin-1', name: 'Sam Patel' }

let auditCounter = 0
function audit(
  reportId: string,
  actor: { id: string; name: string },
  actorRole: AuditEvent['actorRole'],
  action: AuditEvent['action'],
  at: string,
  extra: Partial<Pick<AuditEvent, 'before' | 'after' | 'detail'>> = {},
): AuditEvent {
  auditCounter += 1
  return {
    id: `seed-audit-${auditCounter}`,
    reportId,
    actorId: actor.id,
    actorName: actor.name,
    actorRole,
    action,
    at,
    ...extra,
  }
}

export const seedReports: Report[] = [
  {
    id: 'AER-0001',
    status: 'closed',
    reporterId: alex.id,
    reporterName: alex.name,
    submittedAt: '2026-10-02T09:14:00.000Z',
    updatedAt: '2026-10-09T15:20:00.000Z',
    assignedReviewerId: jordan.id,
    assignedReviewerName: jordan.name,
    reporter: {
      reporterType: 'healthcare-professional',
      name: alex.name,
      email: 'alex.morgan@example.nhs.uk',
      phone: '0161 496 0101',
    },
    patient: { initials: 'JS', age: 34, sex: 'female' },
    medicine: {
      name: 'Amoxicillin 500mg capsules',
      dose: '500mg three times a day',
      route: 'oral',
      startDate: '2026-09-20',
      stopDate: '2026-09-25',
    },
    reaction: {
      description:
        'Widespread itchy maculopapular rash on the trunk and arms from day four of the course.',
      onsetDate: '2026-09-24',
      outcome: 'recovered',
      recoveryDate: '2026-09-30',
      serious: false,
    },
    notes: [
      {
        id: 'seed-note-1',
        reportId: 'AER-0001',
        authorId: jordan.id,
        authorName: jordan.name,
        body: 'Consistent with known amoxicillin hypersensitivity. Non-serious, expected. Closing.',
        createdAt: '2026-10-09T15:18:00.000Z',
      },
    ],
  },
  {
    id: 'AER-0002',
    status: 'under-review',
    reporterId: alex.id,
    reporterName: alex.name,
    submittedAt: '2026-10-21T11:02:00.000Z',
    updatedAt: '2026-10-23T10:05:00.000Z',
    assignedReviewerId: chris.id,
    assignedReviewerName: chris.name,
    reporter: {
      reporterType: 'healthcare-professional',
      name: alex.name,
      email: 'alex.morgan@example.nhs.uk',
    },
    patient: { initials: 'RM', dateOfBirth: '1958-03-12', sex: 'male' },
    medicine: {
      name: 'Metformin 1g tablets',
      dose: '1g twice a day',
      route: 'oral',
      startDate: '2024-02-01',
    },
    reaction: {
      description:
        'Admitted with lactic acidosis after three days of vomiting and reduced fluid intake. Metformin withheld on admission.',
      onsetDate: '2026-10-17',
      outcome: 'recovering',
      recoveryDate: '2026-10-20',
      serious: true,
      seriousnessCriteria: ['hospitalisation', 'life-threatening'],
      hospitalAdmissionDate: '2026-10-18',
      hospitalDischargeDate: '2026-10-22',
    },
    notes: [
      {
        id: 'seed-note-2',
        reportId: 'AER-0002',
        authorId: chris.id,
        authorName: chris.name,
        body: 'Serious, expected. Requesting renal function results from the reporter before closing.',
        createdAt: '2026-10-23T10:05:00.000Z',
      },
    ],
  },
  {
    id: 'AER-0003',
    status: 'submitted',
    reporterId: alex.id,
    reporterName: alex.name,
    submittedAt: '2026-11-05T16:40:00.000Z',
    updatedAt: '2026-11-05T16:40:00.000Z',
    assignedReviewerId: null,
    assignedReviewerName: null,
    reporter: {
      reporterType: 'healthcare-professional',
      name: alex.name,
      email: 'alex.morgan@example.nhs.uk',
    },
    patient: { initials: 'DP', age: 61, sex: 'male' },
    medicine: {
      name: 'Atorvastatin 40mg tablets',
      dose: '40mg at night',
      route: 'oral',
      startDate: '2026-09-01',
    },
    reaction: {
      description:
        'Bilateral thigh and calf muscle pain and weakness, worse on stairs. CK mildly raised.',
      onsetDate: '2026-10-28',
      outcome: 'not-recovered',
      serious: false,
    },
    notes: [],
  },
  {
    id: 'AER-0004',
    status: 'under-review',
    reporterId: priya.id,
    reporterName: priya.name,
    submittedAt: '2026-10-29T08:55:00.000Z',
    updatedAt: '2026-11-03T09:30:00.000Z',
    assignedReviewerId: jordan.id,
    assignedReviewerName: jordan.name,
    reporter: {
      reporterType: 'healthcare-professional',
      name: priya.name,
      email: 'priya.shah@example-pharmacy.co.uk',
      phone: '020 7946 0958',
    },
    patient: { initials: 'KT', age: 27, sex: 'female' },
    medicine: {
      name: 'Phenoxymethylpenicillin 500mg tablets',
      dose: '500mg four times a day',
      route: 'oral',
      startDate: '2026-10-27',
      stopDate: '2026-10-27',
    },
    reaction: {
      description:
        'Anaphylaxis within 30 minutes of the first dose: lip swelling, wheeze and hypotension. Treated with intramuscular adrenaline by ambulance crew.',
      onsetDate: '2026-10-27',
      outcome: 'recovered',
      recoveryDate: '2026-10-28',
      serious: true,
      seriousnessCriteria: ['life-threatening', 'hospitalisation'],
      hospitalAdmissionDate: '2026-10-27',
      hospitalDischargeDate: '2026-10-28',
    },
    notes: [],
  },
  {
    id: 'AER-0005',
    status: 'submitted',
    reporterId: priya.id,
    reporterName: priya.name,
    submittedAt: '2026-11-07T13:10:00.000Z',
    updatedAt: '2026-11-07T13:10:00.000Z',
    assignedReviewerId: null,
    assignedReviewerName: null,
    reporter: {
      reporterType: 'healthcare-professional',
      name: priya.name,
      email: 'priya.shah@example-pharmacy.co.uk',
    },
    patient: { initials: 'MB', age: 72, sex: 'female' },
    medicine: {
      name: 'Ibuprofen 400mg tablets',
      dose: '400mg three times a day',
      route: 'oral',
      startDate: '2026-10-20',
      stopDate: '2026-11-04',
    },
    reaction: {
      description: 'Melaena and a drop in haemoglobin. Endoscopy showed a bleeding gastric ulcer.',
      onsetDate: '2026-11-03',
      outcome: 'recovering',
      recoveryDate: '2026-11-06',
      serious: true,
      seriousnessCriteria: ['hospitalisation'],
      hospitalAdmissionDate: '2026-11-04',
      hospitalDischargeDate: '2026-11-07',
    },
    notes: [],
  },
  {
    id: 'AER-0006',
    status: 'closed',
    reporterId: priya.id,
    reporterName: priya.name,
    submittedAt: '2026-10-12T10:25:00.000Z',
    updatedAt: '2026-10-15T14:00:00.000Z',
    assignedReviewerId: chris.id,
    assignedReviewerName: chris.name,
    reporter: {
      reporterType: 'healthcare-professional',
      name: priya.name,
      email: 'priya.shah@example-pharmacy.co.uk',
    },
    patient: { initials: 'LW', age: 45, sex: 'unknown' },
    medicine: {
      name: 'Sertraline 50mg tablets',
      dose: '50mg once a day',
      route: 'oral',
      startDate: '2026-09-28',
    },
    reaction: {
      description: 'Persistent nausea and loss of appetite for the first two weeks of treatment.',
      onsetDate: '2026-09-30',
      outcome: 'recovered',
      recoveryDate: '2026-10-11',
      serious: false,
    },
    notes: [
      {
        id: 'seed-note-3',
        reportId: 'AER-0006',
        authorId: chris.id,
        authorName: chris.name,
        body: 'Listed, non-serious, resolved without intervention. Closing.',
        createdAt: '2026-10-15T13:58:00.000Z',
      },
    ],
  },
]

export const seedAudit: AuditEvent[] = [
  audit('AER-0001', alex, 'reporter', 'submitted', '2026-10-02T09:14:00.000Z'),
  audit('AER-0001', jordan, 'reviewer', 'status-changed', '2026-10-06T09:00:00.000Z', {
    before: 'submitted',
    after: 'under-review',
  }),
  audit('AER-0001', jordan, 'reviewer', 'note-added', '2026-10-09T15:18:00.000Z', {
    detail: 'Consistent with known amoxicillin hypersensitivity. Non-serious, expected. Closing.',
  }),
  audit('AER-0001', jordan, 'reviewer', 'status-changed', '2026-10-09T15:20:00.000Z', {
    before: 'under-review',
    after: 'closed',
  }),

  audit('AER-0002', alex, 'reporter', 'submitted', '2026-10-21T11:02:00.000Z'),
  audit('AER-0002', chris, 'reviewer', 'status-changed', '2026-10-22T08:45:00.000Z', {
    before: 'submitted',
    after: 'under-review',
  }),
  audit('AER-0002', chris, 'reviewer', 'note-added', '2026-10-23T10:05:00.000Z', {
    detail:
      'Serious, expected. Requesting renal function results from the reporter before closing.',
  }),

  audit('AER-0003', alex, 'reporter', 'submitted', '2026-11-05T16:40:00.000Z'),

  audit('AER-0004', priya, 'reporter', 'submitted', '2026-10-29T08:55:00.000Z'),
  audit('AER-0004', chris, 'reviewer', 'status-changed', '2026-10-30T09:10:00.000Z', {
    before: 'submitted',
    after: 'under-review',
  }),
  audit('AER-0004', sam, 'admin', 'reassigned', '2026-11-03T09:30:00.000Z', {
    before: chris.name,
    after: jordan.name,
  }),

  audit('AER-0005', priya, 'reporter', 'submitted', '2026-11-07T13:10:00.000Z'),

  audit('AER-0006', priya, 'reporter', 'submitted', '2026-10-12T10:25:00.000Z'),
  audit('AER-0006', chris, 'reviewer', 'status-changed', '2026-10-13T11:00:00.000Z', {
    before: 'submitted',
    after: 'under-review',
  }),
  audit('AER-0006', chris, 'reviewer', 'note-added', '2026-10-15T13:58:00.000Z', {
    detail: 'Listed, non-serious, resolved without intervention. Closing.',
  }),
  audit('AER-0006', chris, 'reviewer', 'status-changed', '2026-10-15T14:00:00.000Z', {
    before: 'under-review',
    after: 'closed',
  }),
]
