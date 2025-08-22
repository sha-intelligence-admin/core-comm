import { initSentry } from './lib/sentry'

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    initSentry()
  }
}