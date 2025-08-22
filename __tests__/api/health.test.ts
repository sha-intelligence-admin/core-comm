/**
 * @jest-environment node
 */

import { GET } from '@/app/api/health/route'

// Mock the monitoring module
jest.mock('@/lib/monitoring', () => ({
  monitoring: {
    getHealthStatus: jest.fn()
  }
}))

const { monitoring } = require('@/lib/monitoring')

describe('/api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return healthy status when all checks pass', async () => {
    const mockHealthStatus = {
      status: 'healthy' as const,
      checks: {
        database: { status: 'pass' as const, responseTime: 50 },
        redis: { status: 'pass' as const, responseTime: 10 },
        memory: { status: 'pass' as const, message: 'Memory usage: 45.23MB' }
      },
      timestamp: Date.now(),
      version: '1.0.0'
    }

    ;(monitoring.getHealthStatus as jest.Mock).mockResolvedValue(mockHealthStatus)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
    expect(data.checks).toBeDefined()
    expect(data.timestamp).toBeDefined()
  })

  it('should return unhealthy status when checks fail', async () => {
    const mockHealthStatus = {
      status: 'unhealthy' as const,
      checks: {
        database: { status: 'fail' as const, message: 'Database connection failed' },
        redis: { status: 'pass' as const, responseTime: 10 },
        memory: { status: 'pass' as const, message: 'Memory usage: 45.23MB' }
      },
      timestamp: Date.now(),
      version: '1.0.0'
    }

    ;(monitoring.getHealthStatus as jest.Mock).mockResolvedValue(mockHealthStatus)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.status).toBe('unhealthy')
    expect(data.checks.database.status).toBe('fail')
  })

  it('should handle monitoring service errors', async () => {
    ;(monitoring.getHealthStatus as jest.Mock).mockRejectedValue(new Error('Monitoring error'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.status).toBe('unhealthy')
    expect(data.checks.service.status).toBe('fail')
  })
})