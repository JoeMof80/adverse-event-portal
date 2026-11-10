import { clearDraft, loadDraft, saveDraft, toSubmission, type ReportDraft } from './draft'

const completeDraft: ReportDraft = {
  stepIndex: 4,
  updatedAt: '2026-11-10T10:00:00.000Z',
  reporter: { reporterType: 'carer', name: 'Sam Reporter', email: 'sam@example.com', phone: '' },
  patient: { initials: 'ab', age: '70', dateOfBirth: '', sex: 'female' },
  medicine: {
    name: 'Ibuprofen',
    dose: '400mg tds',
    route: 'oral',
    startDate: '2026-10-20',
    stopDate: '',
  },
  reaction: {
    description: 'Melaena',
    onsetDate: '2026-11-03',
    outcome: 'recovering',
    recoveryDate: '2026-11-06',
    serious: 'yes',
    seriousnessCriteria: ['hospitalisation'],
    hospitalAdmissionDate: '2026-11-04',
    hospitalDischargeDate: '',
  },
}

describe('toSubmission', () => {
  it('maps form values to the API shape, dropping blanks and converting types', () => {
    expect(toSubmission(completeDraft)).toEqual({
      reporter: { reporterType: 'carer', name: 'Sam Reporter', email: 'sam@example.com' },
      patient: { initials: 'AB', sex: 'female', age: 70 },
      medicine: { name: 'Ibuprofen', dose: '400mg tds', route: 'oral', startDate: '2026-10-20' },
      reaction: {
        description: 'Melaena',
        onsetDate: '2026-11-03',
        outcome: 'recovering',
        recoveryDate: '2026-11-06',
        serious: true,
        seriousnessCriteria: ['hospitalisation'],
        hospitalAdmissionDate: '2026-11-04',
      },
    })
  })

  it('discards conditional answers that no longer apply', () => {
    const submission = toSubmission({
      ...completeDraft,
      reaction: { ...completeDraft.reaction!, serious: 'no', outcome: 'unknown' },
    })
    expect(submission.reaction).toEqual({
      description: 'Melaena',
      onsetDate: '2026-11-03',
      outcome: 'unknown',
      serious: false,
    })
  })

  it('throws if a step is incomplete', () => {
    expect(() => toSubmission({ ...completeDraft, medicine: undefined })).toThrow()
  })
})

describe('draft storage', () => {
  it('round-trips per user and clears', () => {
    saveDraft('u-1', completeDraft)
    expect(loadDraft('u-1')).toEqual(completeDraft)
    expect(loadDraft('u-2')).toBeNull()
    clearDraft('u-1')
    expect(loadDraft('u-1')).toBeNull()
  })

  it('ignores corrupt storage', () => {
    localStorage.setItem('aep.draft.u-1', '{not json')
    expect(loadDraft('u-1')).toBeNull()
  })
})
