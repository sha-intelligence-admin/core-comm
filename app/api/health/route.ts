import { NextResponse } from 'next/server'
import { monitoring } from '@/lib/monitoring'

export async function GET() {
  try {
    const healthStatus = await monitoring.getHealthStatus()
    
    // Return appropriate HTTP status based on health
    const httpStatus = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503
    
    return NextResponse.json(healthStatus, { status: httpStatus })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      checks: {
        service: {
          status: 'fail',
          message: 'Health check service error'
        }
      },
      timestamp: Date.now(),
      version: process.env.npm_package_version || '1.0.0'
    }, { status: 503 })
  }
}
