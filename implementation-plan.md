# Implementation Plan

Each phase is delivered as one pull request on a feature branch, reviewed and merged with CI green before the next phase starts. Tasks within a phase are small enough to complete and verify in one sitting.

## Phase 1: Project setup

- [x] Scaffold a Vite project with the React and TypeScript template
- [x] Enable TypeScript strict mode and path aliases
- [x] Add ESLint with typescript-eslint, react-hooks and jsx-a11y plugins
- [x] Add Prettier and an editor config
- [x] Add Husky and lint-staged with a pre-commit hook
- [x] Add Vitest, React Testing Library, user-event, jest-dom and vitest-axe, with a smoke test
- [x] Add npm scripts: dev, build, lint, typecheck, test, format
- [x] Write CLAUDE.md covering project conventions, commands and review expectations
- [x] Initialise git, create the public GitHub repo, push main
- [x] Add a GitHub Actions workflow running lint, typecheck, test and build on pull requests
- [x] Enable branch protection requiring the CI check before merge
- [x] Decided against GitHub Copilot code review: not available on the free plan

## Phase 2: Design tokens and primitives

- [x] Define design tokens as CSS custom properties: colour, spacing, type scale, radius, shadow, focus ring
- [x] Add a global stylesheet with reset, base typography and a visible focus style
- [x] Build Button with primary, secondary and danger variants
- [x] Build Field wrapper handling label, hint, error message and aria wiring
- [x] Build TextInput, Select, RadioGroup and CheckboxGroup using Field
- [x] Build Alert with info, success and error variants and appropriate live region
- [x] Build Stepper showing step names, current step and completed steps
- [x] Build a page layout shell with header, main landmark and skip link
- [x] Write component tests for Field error wiring, RadioGroup keyboard behaviour and Stepper current step, each with an axe check

## Phase 3: Authentication stub and role-aware shell

- [x] Define the User type with id, name and role, and the three roles
- [x] Install Mock Service Worker and register the browser worker
- [x] Build the fake authorise page offering sign-in as Reporter, Reviewer or Admin
- [x] Implement the OIDC-shaped flow: redirect to authorise, return with a code, exchange the code for an ID token through a mocked endpoint
- [x] Store the session in memory with sessionStorage fallback, and expose it through an auth context
- [x] Add React Router with routes for sign-in, callback, reporter home, new report, my reports, review queue and report detail
- [x] Add route guards that redirect unauthenticated users to sign-in and unauthorised roles to their home
- [x] Build the header navigation that shows only the links allowed for the current role
- [x] Add sign-out
- [x] Write tests for the route guards and the role-dependent navigation

## Phase 4: Data model and mock API

- [x] Define the Report type covering all form fields, status, assigned reviewer and timestamps
- [x] Define the AuditEvent type with actor, action, timestamp and before and after values
- [x] Define the ReviewNote type
- [x] Write seed data: six reports in mixed statuses with realistic audit history, plus two reviewers
- [x] Implement a localStorage-backed store that loads seed data on first run
- [x] Add MSW handlers: list reports with status filter and sort, get report, create report, change status, add note, reassign, list audit events
- [x] Make the store append an audit event for every mutating handler
- [x] Add TanStack Query and typed hooks for each endpoint, invalidating the right queries after mutations
- [x] Write tests for the handlers' filtering, sorting and audit side effects

## Phase 5: Adverse event form

- [x] Write Zod schemas for reporter details, patient details, suspect medicine, and reaction and seriousness
- [x] Add conditional rules: seriousness criteria required when serious, hospital dates required when hospitalised, recovery date required when recovered or recovering
- [x] Build the multi-step form container with React Hook Form, one schema per step, and the Stepper
- [x] Build step 1: reporter details
- [x] Build step 2: patient details
- [x] Build step 3: suspect medicine
- [x] Build step 4: reaction and seriousness, with the conditional sections showing and hiding
- [x] Block Continue until the current step validates, and show errors next to fields with an error summary at the top
- [x] Move focus to the step heading on each step change
- [x] Build step 5: review and confirm, listing all answers with an edit link back to each step
- [x] Submit the report through the create endpoint and show a confirmation with the report reference
- [x] Autosave the draft to localStorage on every change, keyed by user
- [x] On the reporter home, offer to continue the most recent draft or start fresh
- [x] Build the my reports page listing the reporter's own submissions and statuses
- [x] Write tests for each schema's conditional rules, the stepper navigation, focus movement and autosave restore

## Phase 6: Reviewer screens

- [x] Build the review queue listing reports with status filter and date submitted sort, defaulting to Submitted and Under review, newest first
- [x] Build the report detail page showing all answers in read-only form
- [x] Add status change actions valid for the current status
- [x] Add review notes: list existing and add new
- [x] Add reassign to another reviewer, visible to Admin only
- [x] Show the audit history for the report in reverse chronological order
- [x] Hide the review queue and actions from Reporters at the component level as well as the route level
- [x] Write tests for filter and sort behaviour, status action visibility by status and role, and the Admin-only reassign control

## Phase 7: Accessibility and quality pass

- [ ] Run axe on every page in component tests and fix findings
- [ ] Complete a keyboard-only walkthrough of sign-in, the full form and the review flow
- [ ] Check colour contrast of all token combinations in use
- [ ] Check every form control has a visible label and every error is announced
- [ ] Check the page title updates on route change
- [ ] Review test coverage of the form logic and role gating and fill gaps

## Phase 8: Documentation and handover

- [ ] Write the README: what it is, how to run it, how to sign in as each role, and the seed data
- [ ] Document how the mocked SSO maps to a real PingFederate integration
- [ ] Document the design tokens and how to add a primitive
- [ ] Document how Claude Code was used during the build and how generated code was reviewed
- [ ] Final review of the pull request history for clear descriptions
