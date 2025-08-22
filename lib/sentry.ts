import * as Sentry from '@sentry/nextjs'

export function initSentry() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
      release: process.env.SENTRY_RELEASE || '1.0.0',
      
      // Performance monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Session replay for debugging (be careful with privacy)
      replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Capture console logs - Updated for Sentry v8
      integrations: [
        Sentry.consoleIntegration(),
        Sentry.replayIntegration()
      ],
      
      // Filter out sensitive data
      beforeSend(event) {
        // Remove sensitive headers
        if (event.request?.headers) {
          delete event.request.headers['authorization']
          delete event.request.headers['cookie']
          delete event.request.headers['x-csrf-token']
        }
        
        // Remove sensitive form data
        if (event.request?.data) {
          if (typeof event.request.data === 'object') {
            const sanitized = { ...event.request.data }
            delete sanitized.password
            delete sanitized.token
            delete sanitized.secret
            event.request.data = sanitized
          }
        }
        
        return event
      },
      
      // Filter out noisy errors
      ignoreErrors: [
        // Browser extension errors
        'top.GLOBALS',
        'originalCreateNotification',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        // Network errors that aren't actionable
        'NetworkError',
        'ChunkLoadError',
        // AbortError from cancelled requests
        'AbortError',
        // React hydration mismatches in development
        process.env.NODE_ENV === 'development' ? 'Hydration failed' : null
      ].filter(Boolean) as string[],
      
      // Performance optimizations
      maxBreadcrumbs: 50,
      attachStacktrace: true,
      sendDefaultPii: false, // Don't send personally identifiable information
      
      // Custom tags for better filtering
      initialScope: {
        tags: {
          component: 'corecomm',
          version: process.env.npm_package_version || '1.0.0'
        }
      }
    })
  }
}

// Helper functions for manual error reporting
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setContext(key, context[key])
      })
    }
    Sentry.captureException(error)
  })
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setContext(key, context[key])
      })
    }
    Sentry.captureMessage(message, level)
  })
}

export function setUserContext(user: {
  id?: string
  email?: string
  role?: string
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role
  })
}

export function addBreadcrumb(message: string, category: string = 'custom', level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    timestamp: Date.now()
  })
}

// Performance monitoring helpers - Updated for Sentry v8
export function startSpan<T>(name: string, operation: string = 'custom', fn: () => T): T {
  return Sentry.startSpan({ name, op: operation }, fn)
}

export function measureFunction<T>(name: string, fn: () => T): T {
  return Sentry.startSpan({ name, op: 'function' }, () => {
    try {
      return fn()
    } catch (error) {
      captureError(error as Error, { function: name })
      throw error
    }
  })
}

export async function measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return Sentry.startSpan({ name, op: 'async_function' }, async () => {
    try {
      return await fn()
    } catch (error) {
      captureError(error as Error, { function: name })
      throw error
    }
  })
}