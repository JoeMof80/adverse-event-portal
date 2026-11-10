# Adverse Event Reporting Portal

A demo portal for reporting suspected adverse drug reactions, modelled on the UK MHRA Yellow Card scheme. Reporters submit through a guided multi-step form; reviewers work a queue with a full audit trail.

## Planning documents

Read these before starting work. They are the source of truth for scope and decisions.

- `project-scope.md`: problem, features and detailed requirements
- `tech-stack.md`: every technology choice and why
- `implementation-plan.md`: phases and tasks; tick tasks off as they land
- `docs/`: architecture, the SSO mapping, the design system and how AI-assisted development was run

## Commands

```
npm run dev          # start the dev server
npm run build        # typecheck and production build
npm run lint         # ESLint
npm run typecheck    # tsc -b
npm test             # Vitest, single run
npm run test:watch   # Vitest, watch mode
npm run format       # Prettier, write
npm run test:coverage  # Vitest with coverage
npm run check:contrast # contrast ratio of every colour pairing in use
```

CI runs lint, typecheck, test and build on every pull request. All four must pass before merge.

## Conventions

- TypeScript strict mode. No `any`, no non-null assertions outside tests and the root render.
- Import from `@/` for anything outside the current folder.
- Components are function components with named props types. One component per file, co-located test and CSS Module.
- Styling uses CSS Modules and design tokens only. Never hard-code a colour, spacing or font value in a component.
- Forms use React Hook Form with a Zod schema per step. Validation lives in the schema, not the component.
- Server state goes through TanStack Query hooks in `src/api`. Components never call fetch directly.
- The API is mocked with Mock Service Worker. Handlers live in `src/mocks` and persist to localStorage.
- Accessibility is a requirement, not a pass at the end. Every interactive component has a label, keyboard support and a visible focus state. Every component test includes an axe check using `@/test/axe`.

## Workflow

- One branch and one pull request per phase of the implementation plan. Branch names are `phase-N-short-description`.
- Commit messages: imperative mood, under 72 characters on the first line.
- Each PR description states what was built, how it was tested, and what AI-generated code was changed or rejected during review.
- Do not merge with failing CI. Do not force-push to main.

## Claude Code helpers

- `/a11y-check` (`.claude/skills/a11y-check`): runs the accessibility sweep, contrast check and keyboard checklist and reports findings. Use before a PR that touches UI.
- `accessibility-reviewer` (`.claude/agents`): a subagent that reviews changed components and styles for WCAG 2.1 AA issues against the conventions above.

## Reviewing generated code

Treat generated code as a first draft. Before committing, check it for: unnecessary abstractions, missing error and empty states, accessibility gaps, hard-coded values that should be tokens, and tests that assert implementation rather than behaviour.
