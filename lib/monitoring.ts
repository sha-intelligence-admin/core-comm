import { NextRequest } from 'next/server'

interface MetricData {
  name: string
  value: number
  tags?: Record<string, string>
  timestamp?: number
}

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: Record<string, {
    status: 'pass' | 'fail'
    message?: string
    responseTime?: number
  }>
  timestamp: number
  version?: string
}

class MonitoringService {
  private metrics: MetricData[] = []
  private maxMetrics = 1000 // Keep last 1000 metrics in memory

  // Record a metric
  recordMetric(name: string, value: number, tags?: Record<string, string>) {
    const metric: MetricData = {
      name,
      value,
      tags,
      timestamp: Date.now()
    }

    this.metrics.push(metric)
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // In production, send to monitoring service (DataDog, New Relic, etc.)
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(metric)
    }
  }

  // Record API response time
  recordApiResponse(endpoint: string, method: string, statusCode: number, responseTime: number) {
    this.recordMetric('api.response_time', responseTime, {
      endpoint,
      method,
      status_code: statusCode.toString()
    })

    this.recordMetric('api.request_count', 1, {
      endpoint,
      method,
      status_code: statusCode.toString()
    })
  }

  // Record authentication events
  recordAuthEvent(event: 'login_success' | 'login_failure' | 'signup' | 'logout', userId?: string) {
    this.recordMetric('auth.events', 1, {
      event,
      user_id: userId || 'anonymous'
    })
  }

  // Record database operations
  recordDbOperation(operation: 'select' | 'insert' | 'update' | 'delete', table: string, duration: number) {
    this.recordMetric('db.operation_time', duration, {
      operation,
      table
    })
  }

  // Record rate limit hits
  recordRateLimitHit(endpoint: string, ip: string) {
    this.recordMetric('rate_limit.hits', 1, {
      endpoint,
      ip: this.hashIp(ip)
    })
  }

  // Get system health status
  async getHealthStatus(): Promise<HealthCheck> {
    const checks: HealthCheck['checks'] = {}
    
    // Database health check
    try {
      const dbStart = Date.now()
      // In a real app, you'd check your database connection here
      await this.checkDatabase()
      checks.database = {
        status: 'pass',
        responseTime: Date.now() - dbStart
      }
    } catch (error) {
      checks.database = {
        status: 'fail',
        message: 'Database connection failed'
      }
    }

    // Redis health check (if using Redis)
    try {
      const redisStart = Date.now()
      await this.checkRedis()
      checks.redis = {
        status: 'pass',
        responseTime: Date.now() - redisStart
      }
    } catch (error) {
      checks.redis = {
        status: 'fail',
        message: 'Redis connection failed'
      }
    }

    // Memory usage check
    const memUsage = process.memoryUsage()
    const memUsageMB = memUsage.heapUsed / 1024 / 1024
    checks.memory = {
      status: memUsageMB > 500 ? 'fail' : 'pass', // Fail if using > 500MB
      message: `Memory usage: ${memUsageMB.toFixed(2)}MB`
    }

    // Determine overall status
    const hasFailures = Object.values(checks).some(check => check.status === 'fail')
    
    return {
      status: hasFailures ? 'unhealthy' : 'healthy',
      checks,
      timestamp: Date.now(),
      version: process.env.npm_package_version || '1.0.0'
    }
  }

  // Get recent metrics
  getMetrics(name?: string, limit: number = 100): MetricData[] {
    let filteredMetrics = this.metrics
    
    if (name) {
      filteredMetrics = this.metrics.filter(m => m.name === name)
    }
    
    return filteredMetrics.slice(-limit)
  }

  private async checkDatabase(): Promise<void> {
    // Implement actual database health check
    // For now, just simulate
    return Promise.resolve()
  }

  private async checkRedis(): Promise<void> {
    // Implement actual Redis health check
    if (process.env.REDIS_URL) {
      // Check Redis connection
      return Promise.resolve()
    }
    throw new Error('Redis not configured')
  }

  private hashIp(ip: string): string {
    // Hash IP for privacy compliance
    const crypto = require('crypto')
    return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 8)
  }

  private sendToMonitoringService(metric: MetricData) {
    // In production, implement sending to your monitoring service
    // Examples:
    // - DataDog: statsd.increment()
    // - New Relic: newrelic.recordMetric()
    // - Custom webhook/API call
    console.log('Metric recorded:', metric)
  }
}

// Singleton instance
export const monitoring = new MonitoringService()

// Middleware helper to track API performance
export function withMonitoring(handler: Function) {
  return async (request: NextRequest, ...args: unknown[]) => {
    const start = Date.now()
    const endpoint = request.nextUrl.pathname
    const method = request.method

    try {
      const response = await handler(request, ...args)
      const duration = Date.now() - start
      const status = response instanceof Response ? response.status : 200
      
      monitoring.recordApiResponse(endpoint, method, status, duration)
      
      return response
    } catch (error) {
      const duration = Date.now() - start
      monitoring.recordApiResponse(endpoint, method, 500, duration)
      throw error
    }
  }
}

// Alert thresholds and notification
export class AlertManager {
  private static thresholds = {
    errorRate: 0.05, // 5% error rate
    responseTime: 2000, // 2 seconds
    memoryUsage: 80 // 80% memory usage
  }

  static checkAlerts() {
    // Implement alert logic based on metrics
    const recentMetrics = monitoring.getMetrics('api.response_time', 100)
    
    if (recentMetrics.length > 0) {
      const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length
      
      if (avgResponseTime > this.thresholds.responseTime) {
        this.sendAlert('High Response Time', `Average response time: ${avgResponseTime}ms`)
      }
    }
  }

  private static sendAlert(title: string, message: string) {
    // In production, send to Slack, email, PagerDuty, etc.
    console.warn(`ALERT: ${title} - ${message}`)
  }
}