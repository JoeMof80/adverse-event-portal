import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useCreateReport } from '@/api/reports'
import { useAuth } from '@/auth/AuthContext'
import { Alert, Button, Stepper } from '@/components'
import type { Report } from '@/domain/report'
import { formatTime } from '@/lib/formatDate'
import {
  clearDraft,
  emptyDraft,
  loadDraft,
  saveDraft,
  toSubmission,
  type DraftSection,
  type ReportDraft,
} from './draft'
import styles from './ReportForm.module.css'
import { REPORT_STEPS, REVIEW_STEP } from './steps'
import { MedicineStep } from './steps/MedicineStep'
import { PatientStep } from './steps/PatientStep'
import { ReactionStep } from './steps/ReactionStep'
import { ReporterStep } from './steps/ReporterStep'
import { ReviewStep } from './steps/ReviewStep'

export function ReportForm() {
  const { user } = useAuth()
  const userId = user?.id ?? 'anonymous'

  const [draft, setDraft] = useState<ReportDraft>(() => loadDraft(userId) ?? emptyDraft())
  const stepIndex = Math.min(draft.stepIndex, REVIEW_STEP)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<Report | null>(null)
  const createReport = useCreateReport()

  const headingRef = useRef<HTMLHeadingElement>(null)
  const confirmationRef = useRef<HTMLHeadingElement>(null)
  const isFirstRender = useRef(true)

  // Move focus to the step heading whenever the step changes, so keyboard and screen reader
  // users land at the top of the new step rather than wherever the Continue button was.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    headingRef.current?.focus()
  }, [stepIndex])

  useEffect(() => {
    if (submitted) confirmationRef.current?.focus()
  }, [submitted])

  // Every change to the draft is written to storage. The first render is the draft as loaded,
  // so it is not announced as a save.
  const skipFirstSave = useRef(true)
  useEffect(() => {
    if (skipFirstSave.current) {
      skipFirstSave.current = false
      return
    }
    saveDraft(userId, draft)
    setSavedAt(draft.updatedAt)
  }, [draft, userId])

  const update = useCallback(
    (patch: Partial<ReportDraft>) =>
      setDraft((previous) => ({ ...previous, ...patch, updatedAt: new Date().toISOString() })),
    [],
  )

  // One stable autosave callback per section, so the steps subscribe once.
  const autosave = useMemo(
    () =>
      Object.fromEntries(
        (['reporter', 'patient', 'medicine', 'reaction'] as const).map((section) => [
          section,
          (values: unknown) => update({ [section]: values }),
        ]),
      ) as Record<DraftSection, (values: unknown) => void>,
    [update],
  )

  const goToStep = useCallback((index: number) => update({ stepIndex: index }), [update])

  const continueFrom = (section: DraftSection) => (values: unknown) =>
    update({ [section]: values, stepIndex: stepIndex + 1 })

  function submit() {
    let submission
    try {
      submission = toSubmission(draft)
    } catch {
      // A step is incomplete; send the reporter back to the first step so it can be corrected.
      goToStep(0)
      return
    }
    createReport.mutate(submission, {
      onSuccess: (report) => {
        clearDraft(userId)
        setSubmitted(report)
      },
    })
  }

  function startAnother() {
    clearDraft(userId)
    skipFirstSave.current = true
    setDraft(emptyDraft())
    setSubmitted(null)
    setSavedAt(null)
    createReport.reset()
  }

  if (submitted) {
    return (
      <div className={styles.confirmation}>
        <div className={styles.confirmationPanel}>
          <h1 ref={confirmationRef} tabIndex={-1}>
            Report submitted
          </h1>
          <p className={styles.reference}>
            Your reference is <strong>{submitted.id}</strong>
          </p>
        </div>
        <p>
          The safety team will review your report. You can follow its progress from{' '}
          <Link to="/reporter/reports">My reports</Link>.
        </p>
        <p>
          <Button variant="secondary" onClick={startAnother}>
            Report another adverse event
          </Button>
        </p>
      </div>
    )
  }

  const backTo = (index: number) => () => goToStep(index)

  return (
    <div className={styles.form}>
      <Stepper steps={REPORT_STEPS} currentIndex={stepIndex} />
      <h1 ref={headingRef} tabIndex={-1} className={styles.heading}>
        {REPORT_STEPS[stepIndex]}
      </h1>
      <p className={styles.saved}>
        {savedAt ? `Draft saved at ${formatTime(savedAt)}` : 'Your answers are saved as you go'}
      </p>
      {stepIndex === 0 && (
        <ReporterStep
          key="reporter"
          defaultValues={draft.reporter}
          onAutosave={autosave.reporter}
          onContinue={continueFrom('reporter')}
        />
      )}
      {stepIndex === 1 && (
        <PatientStep
          key="patient"
          defaultValues={draft.patient}
          onAutosave={autosave.patient}
          onContinue={continueFrom('patient')}
          onBack={backTo(0)}
        />
      )}
      {stepIndex === 2 && (
        <MedicineStep
          key="medicine"
          defaultValues={draft.medicine}
          onAutosave={autosave.medicine}
          onContinue={continueFrom('medicine')}
          onBack={backTo(1)}
        />
      )}
      {stepIndex === 3 && (
        <ReactionStep
          key="reaction"
          defaultValues={draft.reaction}
          onAutosave={autosave.reaction}
          onContinue={continueFrom('reaction')}
          onBack={backTo(2)}
        />
      )}
      {stepIndex === REVIEW_STEP && (
        <ReviewStep
          draft={draft}
          onEdit={goToStep}
          onBack={backTo(3)}
          onSubmit={submit}
          submitting={createReport.isPending}
          submitError={createReport.error?.message ?? null}
        />
      )}
      {createReport.isError && stepIndex !== REVIEW_STEP && (
        <Alert variant="error">
          <p>{createReport.error.message}</p>
        </Alert>
      )}
    </div>
  )
}
