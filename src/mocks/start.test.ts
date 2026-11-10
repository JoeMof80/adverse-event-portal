import { startMocking } from './start'

function fakeWorker(start: () => Promise<unknown>, readyState = 1) {
  return { start, readyState }
}

describe('startMocking', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('resolves as started when the worker confirms', async () => {
    const result = await startMocking(
      fakeWorker(() => Promise.resolve()),
      1000,
    )
    expect(result).toBe('started')
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('resolves after the timeout, with a warning, when the worker never confirms', async () => {
    const pending = startMocking(
      fakeWorker(() => new Promise(() => {})),
      1000,
    )
    await vi.advanceTimersByTimeAsync(1000)
    expect(await pending).toBe('timeout')
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('did not confirm start within 1000ms'),
    )
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('readyState 1'))
  })

  it('rejects when the worker fails to start', async () => {
    await expect(
      startMocking(
        fakeWorker(() => Promise.reject(new Error('no worker'))),
        1000,
      ),
    ).rejects.toThrow('no worker')
  })
})
