import { medicineSchema, patientSchema, reactionSchema, reporterSchema } from './schemas'

function messages(result: {
  success: boolean
  error?: { issues: { path: PropertyKey[]; message: string }[] }
}) {
  return Object.fromEntries((result.error?.issues ?? []).map((i) => [i.path.join('.'), i.message]))
}

describe('reporter schema', () => {
  it('requires a reporter type, name and valid email', () => {
    const result = reporterSchema.safeParse({ name: ' ', email: 'not-an-email', phone: '' })
    expect(result.success).toBe(false)
    expect(messages(result)).toMatchObject({
      reporterType: 'Select who is making this report',
      name: 'Enter your full name',
      email: 'Enter an email address in the correct format, like name@example.com',
    })
  })

  it('accepts a complete reporter and trims whitespace', () => {
    const result = reporterSchema.safeParse({
      reporterType: 'patient',
      name: '  Alex Morgan ',
      email: 'alex@example.com',
      phone: '',
    })
    expect(result.success).toBe(true)
    expect(result.data?.name).toBe('Alex Morgan')
  })
})

describe('patient schema', () => {
  it('requires an age or a date of birth', () => {
    const result = patientSchema.safeParse({
      initials: 'JS',
      age: '',
      dateOfBirth: '',
      sex: 'female',
    })
    expect(messages(result)).toMatchObject({ age: "Enter the patient's age or date of birth" })
  })

  it('accepts either an age or a date of birth', () => {
    expect(
      patientSchema.safeParse({ initials: 'js', age: '34', dateOfBirth: '', sex: 'female' })
        .success,
    ).toBe(true)
    expect(
      patientSchema.safeParse({ initials: 'JS', age: '', dateOfBirth: '1990-05-01', sex: 'male' })
        .success,
    ).toBe(true)
  })

  it('rejects an unrealistic age and a future date of birth', () => {
    const result = patientSchema.safeParse({
      initials: 'JS',
      age: '140',
      dateOfBirth: '2999-01-01',
      sex: 'female',
    })
    expect(messages(result)).toMatchObject({
      age: 'Enter an age in whole years between 0 and 130',
      dateOfBirth: 'The date cannot be in the future',
    })
  })

  it('upper-cases initials and rejects anything but 1 to 4 letters', () => {
    expect(patientSchema.safeParse({ initials: 'ab', age: '1', sex: 'other' }).data?.initials).toBe(
      'AB',
    )
    expect(
      messages(patientSchema.safeParse({ initials: 'A.B.', age: '1', sex: 'other' })),
    ).toMatchObject({
      initials: "Enter the patient's initials, up to 4 letters",
    })
  })
})

describe('medicine schema', () => {
  const valid = {
    name: 'Amoxicillin',
    dose: '500mg tds',
    route: 'oral',
    startDate: '2026-09-20',
    stopDate: '',
  }

  it('accepts a medicine still being taken', () => {
    expect(medicineSchema.safeParse(valid).success).toBe(true)
  })

  it('requires the start date and rejects an impossible one', () => {
    expect(messages(medicineSchema.safeParse({ ...valid, startDate: '' }))).toMatchObject({
      startDate: 'Enter the date the patient started the medicine',
    })
    expect(messages(medicineSchema.safeParse({ ...valid, startDate: '2026-02-30' }))).toMatchObject(
      {
        startDate: 'Enter a real date',
      },
    )
  })

  it('rejects a stop date before the start date', () => {
    expect(messages(medicineSchema.safeParse({ ...valid, stopDate: '2026-09-19' }))).toMatchObject({
      stopDate: 'The stop date must be on or after the start date',
    })
  })
})

describe('reaction schema', () => {
  const base = {
    description: 'Rash on arms',
    onsetDate: '2026-10-01',
    outcome: 'not-recovered',
    recoveryDate: '',
    serious: 'no',
    seriousnessCriteria: false,
    hospitalAdmissionDate: '',
    hospitalDischargeDate: '',
  }

  it('accepts a non-serious reaction with no conditional answers', () => {
    const result = reactionSchema.safeParse(base)
    expect(result.success).toBe(true)
    expect(result.data?.seriousnessCriteria).toEqual([])
  })

  it('requires a recovery date when the patient recovered or is recovering', () => {
    expect(messages(reactionSchema.safeParse({ ...base, outcome: 'recovered' }))).toMatchObject({
      recoveryDate: 'Enter the date the patient recovered or started to recover',
    })
    expect(
      reactionSchema.safeParse({ ...base, outcome: 'recovering', recoveryDate: '2026-10-05' })
        .success,
    ).toBe(true)
  })

  it('requires at least one criterion when serious', () => {
    expect(messages(reactionSchema.safeParse({ ...base, serious: 'yes' }))).toMatchObject({
      seriousnessCriteria: 'Select at least one reason the reaction was serious',
    })
  })

  it('requires an admission date when hospitalised, and orders discharge after it', () => {
    const hospitalised = { ...base, serious: 'yes', seriousnessCriteria: ['hospitalisation'] }
    expect(messages(reactionSchema.safeParse(hospitalised))).toMatchObject({
      hospitalAdmissionDate: 'Enter the date the patient was admitted to hospital',
    })
    expect(
      messages(
        reactionSchema.safeParse({
          ...hospitalised,
          hospitalAdmissionDate: '2026-10-03',
          hospitalDischargeDate: '2026-10-02',
        }),
      ),
    ).toMatchObject({
      hospitalDischargeDate: 'The discharge date must be on or after the admission date',
    })
    expect(
      reactionSchema.safeParse({ ...hospitalised, hospitalAdmissionDate: '2026-10-03' }).success,
    ).toBe(true)
  })

  it('does not ask for hospital dates when the criteria do not include hospitalisation', () => {
    expect(
      reactionSchema.safeParse({
        ...base,
        serious: 'yes',
        seriousnessCriteria: ['life-threatening'],
      }).success,
    ).toBe(true)
  })

  it('rejects a reaction start date in the future', () => {
    expect(messages(reactionSchema.safeParse({ ...base, onsetDate: '2999-01-01' }))).toMatchObject({
      onsetDate: 'The date cannot be in the future',
    })
  })
})
