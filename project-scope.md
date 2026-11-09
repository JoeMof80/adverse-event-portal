# Adverse Event Reporting Portal

## Context

A demonstration project built to evidence the skills in a Senior Front End Engineer job description for a UK pharma client. Not a production system. The regulatory frame of reference is the UK MHRA Yellow Card scheme. The repo and the process used to build it are as much the deliverable as the running app.

## Problem

Pharmaceutical companies must capture reports of suspected side effects (adverse events) from clinicians, pharmacists and patients, and process them within strict regulatory timelines. Today's forms are long, conditional and error-prone. Reporters abandon them halfway, reviewers receive incomplete reports, and nobody can see who changed what.

## Solution

Build a reporting portal that makes submitting an adverse event quick and reliable: a guided multi-step form that saves as you go, shows only the questions that apply, validates before submission, and gives safety reviewers a clear queue with a full audit trail of every action.

## Features

- Multi-step adverse event form with progress indicator
- Autosave drafts, with "continue where you left off"
- Conditional questions (e.g. "serious?" reveals hospitalisation details)
- Validation with clear error messages
- Review and confirm before submission
- Reports list with filtering and sorting (reviewers)
- Report detail view with status and history
- Role-based access: Reporter, Reviewer, Admin
- Single sign-on
- Audit trail of every submission and review action
- Accessible to WCAG 2.1 AA

## Requirements

### Users and roles

All users sign in. There is no anonymous submission. Patients, clinicians and pharmacists all sign in as Reporters.

| Role     | Can do                                                                                         |
| -------- | ---------------------------------------------------------------------------------------------- |
| Reporter | Create, autosave and submit their own reports. View their own report history and status.       |
| Reviewer | View all submitted reports. Filter and sort the queue. Change report status. Add review notes. |
| Admin    | Everything a Reviewer can do, plus reassign a report to another reviewer.                      |

### Report lifecycle

Statuses: Draft, Submitted, Under review, Closed.

- Reporter owns Draft to Submitted.
- Reviewer owns Submitted to Under review to Closed.
- A report cannot be edited or withdrawn after submission.

### The form

Questions are based on the MHRA Yellow Card form. Five steps:

1. Reporter details (reporter type, name, contact)
2. Patient details (initials or identifier, age or date of birth, sex)
3. Suspect medicine (name, dose, route, start and stop dates)
4. Reaction and seriousness (description, onset date, outcome, seriousness)
5. Review and confirm

Conditional branches:

- Seriousness is yes reveals seriousness criteria (hospitalisation, life-threatening, disability, congenital anomaly, death, other medically important) and, for hospitalisation, admission and discharge dates.
- Outcome is recovered or recovering reveals recovery date.

Each step validates before the user can continue. Error messages are specific, visible next to the field, and announced to assistive technology. The review step shows all answers with an edit link back to each step.

Drafts autosave on every change. Returning users are offered to continue their most recent draft.

### Reviewer tools

Reports list filters by status and sorts by date submitted, ascending or descending. Default view is Submitted and Under review, newest first.

Report detail shows all submitted answers, current status, reviewer notes, assigned reviewer, and the audit history for that report.

### Audit trail

Every submission and review action is recorded with who did it, what they did, when, and for status changes the before and after values. Autosaves of drafts are not audited. Audit entries are read-only.

Audited actions: submit, status change, review note added, reassignment.

### Accessibility

WCAG 2.1 AA throughout. In particular: full keyboard operation of the multi-step form, focus moved to the step heading on each step change, errors linked to their fields and announced, visible focus indicators, and colour never the only carrier of meaning.

### Single sign-on

Users authenticate through single sign-on. The identity provider supplies the user's role.

### Demo support

These are not product features but the demo cannot function without them.

- Seed data: around six pre-loaded reports in mixed statuses, each with audit history, so the reviewer queue, filtering, sorting and audit trail can be shown immediately.
- Demo sign-in: a way to sign in quickly as any of the three roles so role-aware UI can be shown in a short walkthrough.
