# Single sign-on

The app signs users in with an OIDC authorization code flow shaped like a PingFederate integration. The identity provider is stood in by a page in this app and a mock token endpoint, so the flow runs with no external service. This document says what the stub does and what each piece becomes in a real integration.

## The flow as implemented

1. The sign-in page builds an authorise URL with `client_id`, `response_type=code`, `scope=openid profile`, `redirect_uri` and a random `state`, stores the state and the page the user was heading for in `sessionStorage`, and navigates to it (`src/auth/oidc.ts`, `beginSignIn`).
2. The authorise page (`/idp/authorise`, `src/pages/AuthorisePage.tsx`) lists the demo accounts. Choosing one asks the mock identity provider for a single-use code and redirects to the callback with `code` and `state`.
3. The callback page checks the state matches this browser session, posts the code to the token endpoint, decodes the ID token, validates its issuer, audience and expiry, and starts the session (`completeSignIn`).
4. The session, including the ID token, is held in a React context and `sessionStorage`. `apiFetch` sends the token as a bearer header and the API handlers decode it to identify the caller and their role.
5. Sign-out clears the session.

## Mapping to PingFederate

| Piece                    | In this demo                                                                                                    | With PingFederate                                                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Authorization endpoint   | `/idp/authorise`, a route in this app                                                                           | `https://<pf-host>/as/authorization.oauth2`                                                                                                     |
| Token endpoint           | `POST /api/oidc/token`, a mock handler                                                                          | `https://<pf-host>/as/token.oauth2`                                                                                                             |
| Client type              | Public, no secret                                                                                               | Public SPA client with PKCE, or a confidential client behind a backend-for-frontend                                                             |
| `state`                  | Random, checked on callback                                                                                     | Same                                                                                                                                            |
| PKCE                     | Not implemented                                                                                                 | Required for a public client: send `code_challenge` (S256) on authorise and `code_verifier` on token exchange                                   |
| ID token                 | Three-part JWT with a fixed signature; issuer, audience, expiry and role claims checked, signature not verified | RS256-signed; verify the signature against the JWKS at `https://<pf-host>/pf/JWKS`, plus issuer, audience, expiry and nonce                     |
| Role claim               | `role` claim issued by the mock, mapped from the demo account                                                   | An attribute in the OpenID Connect policy's attribute contract, usually mapped from a directory group; the claim name is a configuration choice |
| Access token for the API | The ID token is reused as the bearer token                                                                      | A separate access token from the same exchange, validated by the API (signature, audience, scope); the ID token stays in the client             |
| Session storage          | `sessionStorage`                                                                                                | Same for a pure SPA, or an HTTP-only cookie session with a backend-for-frontend, which is the safer default for a regulated service             |
| Token expiry             | Session discarded when the token has expired                                                                    | Refresh with a refresh token or a silent re-authorisation before expiry                                                                         |
| Sign-out                 | Local only                                                                                                      | Also end the identity provider session: `https://<pf-host>/idp/startSLO.ping` or the OIDC end-session endpoint                                  |

## Switching to a real identity provider

- Move the endpoints and client id to environment variables and drop the `/idp/authorise` route and its mock handlers.
- Add PKCE to `beginSignIn` and `completeSignIn`, or replace them with a maintained client such as `oidc-client-ts`, keeping the same session context so the rest of the app does not change.
- Verify the ID token signature against the JWKS in `decodeIdToken`, or let the client library do it.
- Keep the callback page and the guards as they are: they depend only on the session context.

## Why a stub rather than a library

The point of the demo is to show the shape of the integration and the places where it touches the app: the authorise redirect, the callback, the session, the bearer header and the role claim. A hand-written flow keeps all of that readable in four small files. In production, a maintained client library is the right choice and the stub is designed to be replaced by one.
