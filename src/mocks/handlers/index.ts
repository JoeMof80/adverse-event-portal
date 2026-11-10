import { oidcHandlers } from './oidc'
import { reportHandlers } from './reports'

export const handlers = [...oidcHandlers, ...reportHandlers]
