import '@testing-library/jest-dom/vitest'
import * as axeMatchers from 'vitest-axe/matchers'
import { server } from '@/mocks/server'

expect.extend(axeMatchers)

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => {
  server.resetHandlers()
  sessionStorage.clear()
  localStorage.clear()
})
afterAll(() => server.close())
