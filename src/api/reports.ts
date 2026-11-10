import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { User } from '@/auth/types'
import type {
  AuditEvent,
  Report,
  ReportStatus,
  ReportSubmission,
  ReportSummary,
  ReviewNote,
} from '@/domain/report'
import { apiFetch } from './client'

export type ReportListFilters = {
  status?: readonly ReportStatus[]
  order?: 'asc' | 'desc'
}

export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (filters: ReportListFilters) => [...reportKeys.lists(), filters] as const,
  detail: (id: string) => [...reportKeys.all, 'detail', id] as const,
  audit: (id: string) => [...reportKeys.all, 'audit', id] as const,
  reviewers: ['reviewers'] as const,
}

export function reportListOptions(filters: ReportListFilters = {}) {
  return queryOptions({
    queryKey: reportKeys.list(filters),
    queryFn: () => {
      const params = new URLSearchParams()
      for (const status of filters.status ?? []) params.append('status', status)
      if (filters.order) params.set('order', filters.order)
      const query = params.toString()
      return apiFetch<ReportSummary[]>(`/api/reports${query ? `?${query}` : ''}`)
    },
  })
}

export function reportDetailOptions(id: string) {
  return queryOptions({
    queryKey: reportKeys.detail(id),
    queryFn: () => apiFetch<Report>(`/api/reports/${encodeURIComponent(id)}`),
  })
}

export function reportAuditOptions(id: string) {
  return queryOptions({
    queryKey: reportKeys.audit(id),
    queryFn: () => apiFetch<AuditEvent[]>(`/api/reports/${encodeURIComponent(id)}/audit`),
  })
}

export const reviewersOptions = queryOptions({
  queryKey: reportKeys.reviewers,
  queryFn: () => apiFetch<User[]>('/api/reviewers'),
})

export function useReports(filters: ReportListFilters = {}) {
  return useQuery(reportListOptions(filters))
}

export function useReport(id: string) {
  return useQuery(reportDetailOptions(id))
}

export function useReportAudit(id: string) {
  return useQuery(reportAuditOptions(id))
}

export function useReviewers() {
  return useQuery(reviewersOptions)
}

/** After any change to a report, every list, detail and audit query is stale. */
function useInvalidateReports() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: reportKeys.all })
}

export function useCreateReport() {
  const invalidate = useInvalidateReports()
  return useMutation({
    mutationFn: (submission: ReportSubmission) =>
      apiFetch<Report>('/api/reports', { method: 'POST', body: submission }),
    onSuccess: invalidate,
  })
}

export function useChangeReportStatus(id: string) {
  const invalidate = useInvalidateReports()
  return useMutation({
    mutationFn: (status: ReportStatus) =>
      apiFetch<Report>(`/api/reports/${encodeURIComponent(id)}/status`, {
        method: 'POST',
        body: { status },
      }),
    onSuccess: invalidate,
  })
}

export function useAddReviewNote(id: string) {
  const invalidate = useInvalidateReports()
  return useMutation({
    mutationFn: (body: string) =>
      apiFetch<ReviewNote>(`/api/reports/${encodeURIComponent(id)}/notes`, {
        method: 'POST',
        body: { body },
      }),
    onSuccess: invalidate,
  })
}

export function useReassignReport(id: string) {
  const invalidate = useInvalidateReports()
  return useMutation({
    mutationFn: (reviewerId: string) =>
      apiFetch<Report>(`/api/reports/${encodeURIComponent(id)}/assignee`, {
        method: 'POST',
        body: { reviewerId },
      }),
    onSuccess: invalidate,
  })
}
