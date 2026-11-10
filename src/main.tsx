import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/global.css'
import App from './App.tsx'
import { startMocking } from '@/mocks/start'

/**
 * The REST API and identity provider are mocked in the browser by Mock Service Worker.
 * Rendering waits for the worker so the first API calls are intercepted, but never
 * indefinitely: a stalled start must not leave the page blank.
 */
async function enableMocking(): Promise<void> {
  const { worker } = await import('@/mocks/browser')
  await startMocking(worker)
}

function render() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

enableMocking()
  .catch((error: unknown) => console.error('[app] Mocking could not be enabled.', error))
  .then(render)
