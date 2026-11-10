# AI-assisted development

This project was built with Claude Code as the day-to-day development tool. This document describes how it was used, how its output was reviewed, and what the review caught. The pull request history on GitHub is the primary record: every PR description has a "Review of generated code" section.

## How the work was structured

1. **Planning before code.** The scope, the tech stack and a phased implementation plan were written and agreed first, in [project-scope.md](../project-scope.md), [tech-stack.md](../tech-stack.md) and [implementation-plan.md](../implementation-plan.md). Each phase lists small tasks, ticked off as they land.
2. **Conventions in the repo.** [CLAUDE.md](../CLAUDE.md) holds the project conventions, commands and workflow, so every session starts from the same rules: strict TypeScript, tokens only in styling, validation in schemas, axe in every component test, one PR per phase.
3. **One pull request per phase**, on a feature branch, with CI required before merge. The PR description states what was built, how it was tested, and what generated code was changed or rejected.
4. **Current documentation, not memory.** Library APIs were checked against current documentation rather than assumed. That mattered: React Router 8, Mock Service Worker 3, Zod 4 and React Hook Form's `subscribe` API had all moved since the model's training. Those differences were found before the first line, not after.
5. **Verification in a real browser.** Each phase ended with the app running in Chrome, in addition to the tests. Several of the defects below were only visible that way.

## Reviewing generated code

Generated code was treated as a first draft and read before it was committed. The checklist in CLAUDE.md: unnecessary abstractions, missing error and empty states, accessibility gaps, hard-coded values that should be tokens, and tests that assert implementation rather than behaviour. Examples of what the review changed, all recorded in the PR they belong to:

| Phase | What was caught                                                                                                                                          | What was done                                                                    |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1     | The scaffold shipped oxlint and TypeScript 7, which the documented stack and its plugins did not support                                                 | Replaced with ESLint 9 and pinned TypeScript 5, with the reasons written down    |
| 2     | `aria-required` on a `fieldset`, which axe flagged as not allowed                                                                                        | Removed; the requirement is conveyed by the error message                        |
| 3     | A single-use authorisation code would be exchanged twice under React Strict Mode                                                                         | Guarded the callback effect                                                      |
| 4     | A test wrapper created a new `QueryClient` on every render, so hook tests passed or failed on timing                                                     | Fixed the wrapper                                                                |
| 5     | The draft was read from a ref during render, which the react-hooks lint rules reject                                                                     | Reworked to state with a persist effect and stable callbacks                     |
| 5     | React Hook Form's `subscribe` fires once on mount, so opening the form created and announced an empty draft; seen in the browser, not the tests          | Ignore the mount-time callback, with a test                                      |
| 6     | Three generated tests depended on timing because the loading state shares the page heading                                                               | Tests wait for data                                                              |
| 6     | Un-ticking every status filter was indistinguishable from the default in the URL                                                                         | Explicit empty selection                                                         |
| 7     | The persist effect's skip-first-run guard only skipped the first of Strict Mode's two runs; tests did not render in Strict Mode so they could not see it | Tests now render in Strict Mode; the effect compares against the draft as loaded |
| 7     | After a status change the activated button disappears and focus fell to the body                                                                         | Focus moves to the confirmation message                                          |
| Fix   | The app only rendered after the mock worker's start promise resolved, which never settles when a registration already exists, leaving a blank page       | A timed start that renders anyway and logs the worker state                      |

The last of these is worth a sentence: every phase had been checked in a fresh tab with a freshly registered worker, so it passed every time, and the user hit it first on a tab with an existing registration. The lesson applied afterwards was to check in the state a returning user would be in, not only the state a new one would be in.

## Claude Code configuration in this repo

- **`CLAUDE.md`**: conventions, commands, workflow and the review checklist, loaded into every session.
- **`.claude/skills/a11y-check`**: a custom skill that runs the accessibility sweep, the contrast check and a keyboard checklist, and reports the results. Invoke it with `/a11y-check` in Claude Code.
- **`.claude/agents/accessibility-reviewer.md`**: a subagent that reviews changed components and styles for WCAG 2.1 AA issues against the project's conventions and returns findings with file and line references.

## What was not used

GitHub Copilot code review needs a paid plan and was not used; every PR was reviewed by a person. Parallel git worktrees were not needed for a single-developer, one-phase-at-a-time workflow, though the branch-per-phase structure would support them.
