#!/usr/bin/env node
/**
 * Checks the contrast ratio of every foreground/background token pairing the UI uses.
 * Reads the values from src/styles/tokens.css so the check stays in step with the tokens.
 *
 *   node scripts/contrast.mjs
 *
 * Exits non-zero if any pairing falls below its WCAG 2.1 AA minimum (4.5:1 for text,
 * 3:1 for non-text such as focus indicators and control boundaries).
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const css = readFileSync(join(here, '..', 'src', 'styles', 'tokens.css'), 'utf8')

const tokens = {}
for (const [, name, value] of css.matchAll(/--(colour-[\w-]+):\s*(#[0-9a-fA-F]{6})/g)) {
  tokens[name] = value
}

function luminance(hex) {
  const [r, g, b] = hex
    .match(/\w\w/g)
    .map((h) => parseInt(h, 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function ratio(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

/** [description, foreground token, background token, minimum ratio] */
const pairings = [
  ['Body text on page', 'colour-text', 'colour-background', 4.5],
  ['Body text on surface', 'colour-text', 'colour-surface', 4.5],
  ['Muted text on page', 'colour-text-muted', 'colour-background', 4.5],
  ['Muted text on surface', 'colour-text-muted', 'colour-surface', 4.5],
  ['Link on page', 'colour-primary', 'colour-background', 4.5],
  ['Link hover on page', 'colour-primary-hover', 'colour-background', 4.5],
  ['Error text on page', 'colour-error', 'colour-background', 4.5],
  ['Success text on page', 'colour-success', 'colour-background', 4.5],
  ['Primary button text', 'colour-text-inverse', 'colour-primary', 4.5],
  ['Primary button hover text', 'colour-text-inverse', 'colour-primary-hover', 4.5],
  ['Danger button text', 'colour-text-inverse', 'colour-error', 4.5],
  ['Secondary button text', 'colour-text', 'colour-surface', 4.5],
  ['Header text', 'colour-text-inverse', 'colour-text', 4.5],
  ['Submitted tag', 'colour-text-inverse', 'colour-primary', 4.5],
  ['Under review tag', 'colour-text', 'colour-focus', 4.5],
  ['Confirmation panel text', 'colour-text-inverse', 'colour-success', 4.5],
  ['Focus ring edge against page', 'colour-focus-edge', 'colour-background', 3],
  ['Focus ring against its edge', 'colour-focus', 'colour-focus-edge', 3],
  ['Control border against page', 'colour-border-strong', 'colour-background', 3],
  ['Control border against surface', 'colour-border-strong', 'colour-surface', 3],
]

let failed = false
for (const [description, fg, bg, minimum] of pairings) {
  if (!tokens[fg] || !tokens[bg]) {
    console.log(`SKIP        ${description} (missing token ${tokens[fg] ? bg : fg})`)
    continue
  }
  const value = ratio(tokens[fg], tokens[bg])
  const ok = value >= minimum
  if (!ok) failed = true
  console.log(
    `${ok ? 'PASS' : 'FAIL'} ${value.toFixed(2).padStart(6)}  ${description} (min ${minimum}:1)`,
  )
}

console.log(
  '\nNot checked, by design: disabled controls are exempt from contrast requirements, and the ' +
    'light divider lines (colour-border) are decorative, not control boundaries.',
)
process.exit(failed ? 1 : 0)
