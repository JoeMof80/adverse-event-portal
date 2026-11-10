import { unregisterStaleWorkers } from './browser'

function fakeRegistration(scriptURL: string) {
  return {
    active: { scriptURL },
    waiting: null,
    installing: null,
    unregister: vi.fn(() => Promise.resolve(true)),
  }
}

describe('unregisterStaleWorkers', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'serviceWorker')
  })

  it('does nothing where service workers are unsupported', async () => {
    expect(await unregisterStaleWorkers()).toBe(0)
  })

  it('unregisters only registrations of the old mock worker script', async () => {
    const stale = fakeRegistration('http://localhost:5173/mockServiceWorker.js')
    const other = fakeRegistration('http://localhost:5173/some-other-worker.js')
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { getRegistrations: () => Promise.resolve([stale, other]) },
    })

    expect(await unregisterStaleWorkers()).toBe(1)
    expect(stale.unregister).toHaveBeenCalledTimes(1)
    expect(other.unregister).not.toHaveBeenCalled()
  })

  it('tolerates a failing registrations lookup', async () => {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { getRegistrations: () => Promise.reject(new Error('blocked')) },
    })
    expect(await unregisterStaleWorkers()).toBe(0)
  })
})
