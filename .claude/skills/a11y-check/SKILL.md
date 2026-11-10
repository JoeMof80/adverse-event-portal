---
name: a11y-check
description: Run the project's accessibility checks (page-wide axe sweep, contrast ratios, keyboard checklist) and report findings with file references. Use before opening a pull request that touches components, pages or styles.
---

# Accessibility check

Run every check below, then report. Do not skip a check because the others passed.

## 1. Automated checks

```
npm test -- src/test/a11y.test.tsx
npm run check:contrast
npm run lint
```

- The sweep test runs axe on every page state and checks each page sets a title. A failure names the rule and the element.
- The contrast script reads `src/styles/tokens.css` and checks every colour pairing in use. If a token changed, add any new pairing to `scripts/contrast.mjs`.
- ESLint includes `jsx-a11y`.

## 2. Keyboard checklist

Start the dev server and, using only the keyboard, confirm:

- Tab reaches every interactive element in a sensible order, and nothing is reachable that should not be.
- The skip link is the first focusable element and moves focus to `main`.
- The focus ring is visible on every focused element, including links in the dark header.
- Each form step: Continue with empty fields focuses the error summary; each summary link focuses its field; Continue with valid fields focuses the next step's heading.
- Any action that removes the control that was activated moves focus somewhere sensible, such as the confirmation message.
- Conditional fields appear and disappear without moving focus unexpectedly.

## 3. Screen reader semantics

For anything new, check in the tests or by reading the DOM:

- Every control has a visible label, via `Field` or a `legend`.
- Hints and errors are in the control's `aria-describedby`; errors set `aria-invalid`.
- Status messages use `role="status"`; errors that need immediate attention use `role="alert"`.
- Headings nest without skipping levels and each page has one `h1`.

## 4. Report

List findings as: file and line, the rule or principle, what a user would experience, and the fix. State plainly which checks passed. If everything passes, say so in one line.
