# Tech Stack

## Core

| Layer           | Choice                                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| Language and UI | React with TypeScript, strict mode                                                                          |
| Build           | Vite, npm as package manager                                                                                |
| Tests           | Vitest, React Testing Library, user-event, jest-dom                                                         |
| Repo and CI     | GitHub, feature branches, pull requests, GitHub Actions running lint, typecheck, test and build on every PR |
| Agentic tooling | Claude Code with CLAUDE.md, a custom skill, a subagent and parallel worktrees                               |

## Version pins

- TypeScript is pinned to 5.x. The Vite template now ships TypeScript 7, which typescript-eslint does not yet support.
- ESLint is pinned to 9.x. eslint-plugin-jsx-a11y does not yet declare support for ESLint 10.

Both pins can be lifted when the upstream plugins catch up.

## Routing

React Router. The default for a React single-page app and the most common choice in enterprise repos.

## Forms

React Hook Form with Zod. One Zod schema per form step gives typed validation, conditional rules through refinements, and the same schemas reused to validate the whole report on the review step. React Hook Form provides per-step validation, dirty tracking for autosave, and good performance on long forms.

## State management

No global store library. Deliberate split by kind of state:

- Form state: React Hook Form.
- Server state: TanStack Query over the REST API, giving caching and invalidation after status changes.
- Auth and role: a small React context.
- Draft autosave: localStorage, written from React Hook Form's watch.

A store such as Redux would add ceremony without payoff at this scale.

## Styling and design system

CSS Modules with design tokens as CSS custom properties. Tokens live in one file covering colour, spacing, type scale, radius, shadow and focus ring. Primitive components consume only tokens and never hard-coded values. No Tailwind.

## Components

Hand-rolled primitives on native HTML elements: Button, TextInput, Select, RadioGroup, CheckboxGroup, Field (label, hint, error), Alert, Stepper. Native elements provide most WCAG behaviour by default. No headless component library is needed.

## API

Mock Service Worker in the browser. Handlers mirror a plausible REST shape (reports, report detail, status changes, notes, reassignment, audit events) and persist to localStorage so data survives reloads. Seed data loads on first run. Swapping to a real backend is a base URL change.

## Single sign-on

A hand-rolled stub of the OIDC authorization code flow, shaped like PingFederate: sign-in redirects to a fake authorise page, the code exchange is handled by Mock Service Worker, and the ID token carries the user's role claim. The demo sign-in is the fake authorise page offering the three roles. The README documents how each piece maps to a real PingFederate integration.

## Accessibility tooling

eslint-plugin-jsx-a11y for static checks. axe-core through vitest-axe in component tests. Manual keyboard-only pass before each PR touching the form.

## Code quality

ESLint with typescript-eslint, Prettier, and a pre-commit hook via Husky and lint-staged running lint and format on staged files.

## Deployment

None for now. The app runs locally.

## Code review

Human review of every pull request, with the PR description recording what generated code was changed or rejected. Copilot code review is not used: it needs a paid plan.
