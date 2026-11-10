import { useState, type FormEvent } from 'react'
import { useAddReviewNote } from '@/api/reports'
import { useAuth } from '@/auth/AuthContext'
import { Alert, Button, Field, TextArea } from '@/components'
import type { Report } from '@/domain/report'
import { formatDateTime } from '@/lib/formatDate'
import styles from './ReviewNotes.module.css'

type ReviewNotesProps = {
  report: Report
}

export function ReviewNotes({ report }: ReviewNotesProps) {
  const { user } = useAuth()
  const addNote = useAddReviewNote(report.id)
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const canAdd = user?.role === 'reviewer' || user?.role === 'admin'

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!body.trim()) {
      setError('Enter a note')
      return
    }
    setError(null)
    addNote.mutate(body.trim(), { onSuccess: () => setBody('') })
  }

  return (
    <section aria-labelledby="notes-heading" className={styles.notes}>
      <h2 id="notes-heading">Review notes</h2>
      {report.notes.length === 0 ? (
        <p>No notes yet.</p>
      ) : (
        <ul className={styles.list}>
          {report.notes.map((note) => (
            <li key={note.id} className={styles.note}>
              <p className={styles.meta}>
                <strong>{note.authorName}</strong>, {formatDateTime(note.createdAt)}
              </p>
              <p className={styles.body}>{note.body}</p>
            </li>
          ))}
        </ul>
      )}
      {canAdd && (
        <form noValidate onSubmit={handleSubmit} className={styles.form}>
          {addNote.isError && (
            <Alert variant="error" title="The note could not be added">
              <p>{addNote.error.message}</p>
            </Alert>
          )}
          <Field id="new-note" label="Add a note" error={error ?? undefined}>
            <TextArea rows={3} value={body} onChange={(event) => setBody(event.target.value)} />
          </Field>
          <Button type="submit" disabled={addNote.isPending}>
            Add note
          </Button>
        </form>
      )}
    </section>
  )
}
