import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { saveSession } from '@/auth/session'
import { store } from '@/mocks/store'
import { makeSession } from '@/test/renderApp'
import { createQueryClient } from './queryClient'
import { useChangeReportStatus, useReports } from './reports'

/** One query client per test; the wrapper must not create a new one on every render. */
function makeWrapper() {
  const queryClient = createQueryClient({ retry: false })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

beforeEach(() => {
  store.reset()
  saveSession(makeSession('reviewer'))
})

describe('report hooks', () => {
  it('loads the filtered list with the signed-in user', async () => {
    const { result } = renderHook(() => useReports({ status: ['submitted'] }), {
      wrapper: makeWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.map((r) => r.id)).toEqual(['AER-0005', 'AER-0003'])
  })

  it('refetches lists after a status change', async () => {
    const { result } = renderHook(
      () => ({
        list: useReports({ status: ['submitted'] }),
        change: useChangeReportStatus('AER-0003'),
      }),
      { wrapper: makeWrapper() },
    )
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true))
    expect(result.current.list.data).toHaveLength(2)

    result.current.change.mutate('under-review')
    await waitFor(() => expect(result.current.change.isSuccess).toBe(true))
    await waitFor(() => expect(result.current.list.data).toHaveLength(1))
    expect(result.current.list.data?.[0]?.id).toBe('AER-0005')
  })

  it('surfaces API errors', async () => {
    const { result } = renderHook(() => useChangeReportStatus('AER-0003'), {
      wrapper: makeWrapper(),
    })
    result.current.mutate('closed')
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('A report cannot move from submitted to closed')
  })
})
