import { QueryClient } from '@tanstack/react-query'

export function createQueryClient(options: { retry?: boolean } = {}): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: options.retry ?? 1,
        staleTime: 30 * 1000,
      },
    },
  })
}
