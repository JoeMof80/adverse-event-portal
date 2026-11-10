import { FetchInterceptor } from '@mswjs/interceptors/fetch'
import { XMLHttpRequestInterceptor } from '@mswjs/interceptors/XMLHttpRequest'
import { defineNetwork, InterceptorSource } from 'msw/experimental'
import { handlers } from './handlers'

/**
 * The mock API in the browser.
 *
 * Requests are intercepted in the page itself, the way Mock Service Worker works in Node and
 * in browsers without service worker support, rather than through a registered service
 * worker. A service worker has a lifecycle of its own (registration, activation, a client
 * handshake, and a registration that outlives the page), and a stale one left the app
 * blank or let API calls fall through to the dev server. In-page interception has none of
 * that: it is enabled before the app renders and gone when the page is.
 */
export const network = defineNetwork({
  sources: [
    new InterceptorSource({
      interceptors: [new FetchInterceptor(), new XMLHttpRequestInterceptor()],
    }),
  ],
  handlers,
  onUnhandledFrame: 'bypass',
  context: { quiet: true },
})

const WORKER_SCRIPT = '/mockServiceWorker.js'

/**
 * Earlier builds registered a service worker. One left behind in a browser would still
 * control the page, so remove any that are found before enabling interception.
 */
export async function unregisterStaleWorkers(): Promise<number> {
  if (!('serviceWorker' in navigator)) return 0
  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    const stale = registrations.filter((registration) =>
      [registration.active, registration.waiting, registration.installing].some((worker) =>
        worker?.scriptURL.endsWith(WORKER_SCRIPT),
      ),
    )
    await Promise.all(stale.map((registration) => registration.unregister()))
    return stale.length
  } catch {
    return 0
  }
}

/** Enables the mock API. Resolves once requests are being intercepted. */
export async function enableMocking(): Promise<void> {
  await unregisterStaleWorkers()
  await network.enable()
}
