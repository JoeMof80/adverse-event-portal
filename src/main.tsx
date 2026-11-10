import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/global.css'
import App from './App.tsx'

function render() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

/** The REST API and identity provider are mocked in the page by Mock Service Worker. */
import('@/mocks/browser')
  .then(({ enableMocking }) => enableMocking())
  .catch((error: unknown) => console.error('[app] Mocking could not be enabled.', error))
  .then(render)
