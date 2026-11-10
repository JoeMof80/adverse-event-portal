/** How long to wait for the mock worker before rendering anyway. */
export const WORKER_START_TIMEOUT_MS = 3000

type StartableWorker = {
  start: (options: { onUnhandledFrame: 'bypass'; quiet: boolean }) => Promise<unknown>
  readonly readyState: number
}

/**
 * Starts the mock worker and resolves once it confirms, or after a timeout.
 *
 * In practice the worker is enabled and already intercepting requests well within the
 * timeout, but when the page loads with a registration from an earlier visit the start
 * promise has been seen never to settle. Rendering must not depend on it indefinitely.
 */
export async function startMocking(
  worker: StartableWorker,
  timeoutMs = WORKER_START_TIMEOUT_MS,
): Promise<'started' | 'timeout'> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<'timeout'>((resolve) => {
    timer = setTimeout(() => resolve('timeout'), timeoutMs)
  })
  const started = worker
    .start({ onUnhandledFrame: 'bypass', quiet: true })
    .then(() => 'started' as const)

  try {
    const result = await Promise.race([started, timeout])
    if (result === 'timeout') {
      console.warn(
        `[app] Mock Service Worker did not confirm start within ${timeoutMs}ms ` +
          `(readyState ${worker.readyState}). Rendering anyway.`,
      )
    }
    return result
  } finally {
    clearTimeout(timer)
  }
}
