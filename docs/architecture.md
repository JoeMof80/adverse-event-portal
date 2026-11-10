# Architecture

## The shape of the app

A single-page React application. Everything a server would normally do is mocked in the browser so the app runs anywhere Node runs.

```
Browser
  React pages and components
    TanStack Query hooks (src/api)
      apiFetch: JSON over fetch, bearer token attached
        Mock Service Worker (src/mocks/handlers)
          localStorage store (src/mocks/store), seeded on first run
```

The service worker intercepts `fetch` calls to `/api/...`. The handlers authenticate the bearer token, check the caller's role, read and write the store, and append an audit event for every mutation. The pages never know the API is mocked; swapping to a real backend is a base URL and a worker toggle.

## Sign-in

`src/auth` implements the client half of an OIDC authorization code flow. The sign-in page builds an authorise URL with a random `state`; the callback page checks the state, exchanges the code at the token endpoint, decodes and validates the ID token, and stores the session. The identity provider is a route in this app (`/idp/authorise`) and the token endpoint is a mock handler. [docs/sso.md](sso.md) maps each piece to PingFederate.

The session lives in a React context and in `sessionStorage`. `apiFetch` reads the ID token from the session and sends it as a bearer header, and the handlers decode it to find out who is calling.

## Roles

Three roles: reporter, reviewer, admin. Role is enforced three times, each for a different reason:

- **Routes** (`src/routes/guards.tsx`): signed-out users go to sign-in and come back afterwards; the wrong role is sent to its own home.
- **Components**: the actions, notes and reassignment components render nothing for roles that may not use them, so a layout change cannot expose them.
- **API handlers**: every mutating endpoint checks the role, and reporters only ever see their own reports. The UI is not the only line of defence.

## The form

`src/features/report-form` is five steps. Each of the first four is its own React Hook Form instance with its own Zod schema, so `register` stays simple and the schema is the single place a rule lives. The container (`ReportForm.tsx`) holds the draft, the step index and the submission.

- **Conditional questions** are driven by `useWatch` in the step, and the same conditions are enforced in the schema's `superRefine`, so the UI and validation cannot disagree.
- **Errors** render beside each field and in a summary at the top that links to each field. The summary takes focus when validation fails.
- **Autosave** subscribes to the step's values and writes the whole draft, with the current step, to `localStorage` keyed by user. The mount-time subscription callback is ignored, so opening the form does not create a draft.
- **Focus** moves to the step heading on every step change and to the confirmation on submit.
- **Submission** re-validates every step through its schema (`toSubmission`), maps form values to the API shape, and drops conditional answers that no longer apply.

Drafts never reach the API. The three server statuses are submitted, under review and closed.

## The review screens

The queue keeps its filter and sort in the URL, so a view survives refresh and can be shared. The detail page composes the read-only answers, the actions panel, the notes and the history. Every mutation invalidates all report queries, so status, assignment and history refresh together after an action, and focus moves to the confirmation message because the button that was pressed may no longer exist.

## Design system

Tokens in `src/styles/tokens.css` are the only place a colour, size or spacing value is defined. Primitives in `src/components` consume tokens through CSS Modules. `Field` supplies the id, description and invalid state to its control through context, so a control rendered outside a `Field` throws rather than rendering unlabelled. See [docs/design-system.md](design-system.md).

## Tests

- **Unit**: schemas, the submission mapping, draft storage, ID token handling, the timed worker start.
- **Component**: every primitive, with an axe check.
- **API**: the handlers called over fetch with real ID tokens for each role.
- **Flow**: the real route tree in a memory router, driven with user-event: sign-in through the identity provider, the whole form to submission, the review actions.
- **Sweep**: every page state through axe, plus the page title.

Tests render in React Strict Mode, as development does, so double-run effects are exercised.
