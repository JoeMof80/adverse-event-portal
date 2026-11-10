import type { AuditEvent, Report, ReviewNote } from '@/domain/report'
import { seedAudit, seedReports } from './seed'

/*
 * The mock API's database: a JSON document in localStorage so data survives reloads.
 * Seed data loads on first run. Every call reads and writes the whole document, which is
 * fine at demo scale and keeps the handlers free of caching bugs.
 */

const DB_KEY = 'aep.db'

type Db = {
  reports: Report[]
  audit: AuditEvent[]
  nextReportNumber: number
}

function seed(): Db {
  return {
    reports: structuredClone(seedReports),
    audit: structuredClone(seedAudit),
    nextReportNumber: seedReports.length + 1,
  }
}

function read(): Db {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) return JSON.parse(raw) as Db
  } catch {
    // Fall through to a fresh seed.
  }
  const db = seed()
  write(db)
  return db
}

function write(db: Db): void {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {
    // Storage unavailable; the mutation is lost on reload but this request still succeeds.
  }
}

export const store = {
  reset(): void {
    write(seed())
  },

  listReports(): Report[] {
    return read().reports
  },

  getReport(id: string): Report | undefined {
    return read().reports.find((report) => report.id === id)
  },

  nextReference(): string {
    const db = read()
    const reference = `AER-${String(db.nextReportNumber).padStart(4, '0')}`
    db.nextReportNumber += 1
    write(db)
    return reference
  },

  insertReport(report: Report): Report {
    const db = read()
    db.reports.push(report)
    write(db)
    return report
  },

  updateReport(id: string, patch: Partial<Report>): Report | undefined {
    const db = read()
    const index = db.reports.findIndex((report) => report.id === id)
    const existing = db.reports[index]
    if (!existing) return undefined
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() }
    db.reports[index] = updated
    write(db)
    return updated
  },

  addNote(note: ReviewNote): Report | undefined {
    const db = read()
    const report = db.reports.find((candidate) => candidate.id === note.reportId)
    if (!report) return undefined
    report.notes.push(note)
    report.updatedAt = note.createdAt
    write(db)
    return report
  },

  addAudit(event: AuditEvent): void {
    const db = read()
    db.audit.push(event)
    write(db)
  },

  listAudit(reportId: string): AuditEvent[] {
    return read().audit.filter((event) => event.reportId === reportId)
  },
}
