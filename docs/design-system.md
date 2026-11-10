# Design system

## Tokens

`src/styles/tokens.css` defines every colour, font size, spacing step, radius, shadow and the focus ring as CSS custom properties. Components never hard-code one of these values; they reference a token. That is what makes the look a single file's concern.

| Group                     | Examples                                                                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Colour, text and surfaces | `--colour-text`, `--colour-text-muted`, `--colour-background`, `--colour-surface`, `--colour-border-strong` |
| Colour, semantic          | `--colour-primary`, `--colour-success`, `--colour-error`, `--colour-focus`                                  |
| Typography                | `--font-size-sm` to `--font-size-2xl`, `--font-weight-bold`, `--line-height-base`                           |
| Spacing                   | `--space-1` (0.25rem) to `--space-8` (4rem)                                                                 |
| Borders and radius        | `--border-width`, `--border-width-thick`, `--radius-sm` to `--radius-lg`                                    |
| Focus                     | `--focus-ring`, `--focus-shadow`                                                                            |
| Layout                    | `--content-max-width`, `--control-height`, `--control-min-width`                                            |
| Motion                    | `--transition-fast`, zeroed under `prefers-reduced-motion`                                                  |

`src/styles/global.css` applies a reset, base typography, and one focus style for every focusable element via `:focus-visible`. Nothing removes it.

Run `npm run check:contrast` to see the contrast ratio of every colour pairing the UI uses. It reads the tokens file, so it stays correct when a value changes, and it fails if any pairing drops below its WCAG 2.1 AA minimum.

## Primitives

All in `src/components`, each in its own folder with a CSS Module and a test file that includes an axe check.

| Primitive                         | Purpose                                                                                                                                                                                        |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                          | Primary, secondary and danger variants. Defaults to `type="button"` so it never submits a form by accident.                                                                                    |
| `Field`                           | Wraps a control with its label, hint and error, and wires `id`, `aria-describedby`, `aria-invalid` and `aria-required` through context. Required by default; optional fields say "(optional)". |
| `TextInput`, `TextArea`, `Select` | Controls that must sit inside a `Field`. Rendering one outside throws, so an unlabelled control cannot ship.                                                                                   |
| `RadioGroup`, `CheckboxGroup`     | A `fieldset` and `legend` with hint and error. `name`, `onChange`, `onBlur` and `ref` are spread onto every input, so a React Hook Form `register()` result spreads straight onto the group.   |
| `Alert`                           | Info, success and error. Errors use `role="alert"`, the rest `role="status"`. Focusable, so a page can move focus to it after an action.                                                       |
| `Stepper`                         | Progress for a multi-step form: a labelled `nav`, `aria-current="step"` on the current step, completed steps announced.                                                                        |
| `StatusTag`                       | A report's status as a coloured label.                                                                                                                                                         |
| `SummaryList`                     | Label and value pairs for reviewing answers.                                                                                                                                                   |
| `PageLayout`                      | Skip link, header with navigation slot, and the `main` landmark.                                                                                                                               |

## Adding a primitive

1. Create `src/components/Name/Name.tsx`, `Name.module.css` and `Name.test.tsx`.
2. Use native elements where one exists; most keyboard and screen reader behaviour comes free.
3. Style only with tokens. If you need a value that does not exist, add a token rather than a literal.
4. If it is a form control, read its wiring from `useFieldContext` rather than taking `id` or `aria-*` props.
5. In the test, cover the behaviour that matters and finish with an axe check using `@/test/axe`.
6. Export it from `src/components/index.ts`.

## Why it looks like GOV.UK

The visual language is deliberately close to the GOV.UK Design System: the colour palette, the yellow focus ring with a dark edge, the error summary that links to each field, the red left border on a field in error, "(optional)" in the label rather than asterisks on required fields, and the check-your-answers step. This is a choice, and here is the reasoning.

- **The patterns are proven.** GOV.UK's form patterns are among the best-documented and most user-tested accessible patterns available in English, and the reasoning behind each one is public. Reusing them means the demo's accessibility rests on evidence rather than on taste.
- **The audience recognises them.** The portal is for a UK pharmaceutical setting. NHS services, the MHRA and the Yellow Card scheme itself all use these patterns, so clinicians, pharmacists and safety reviewers already know how they behave.
- **It keeps the system small.** Borrowing a coherent set of conventions means fewer decisions to make and defend, which matters when the system has to be built and documented in a short time.

What it is not: the GOV.UK Frontend library is not a dependency, no crown or GOV.UK branding is used, the palette values are this project's own tokens, and nothing here claims to be a government service. A company adopting this would re-skin it by changing the tokens file. The structural accessibility, which lives in the primitives rather than the colours, would carry over unchanged.
