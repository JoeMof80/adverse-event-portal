import { configureAxe } from 'vitest-axe'

// jsdom cannot compute colour contrast, so that rule is checked manually (see implementation plan, Phase 7).
export const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
  },
})
