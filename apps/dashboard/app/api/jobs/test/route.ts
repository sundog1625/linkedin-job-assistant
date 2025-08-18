import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Jobs API Test Endpoint Working',
    userId: '550e8400-e29b-41d4-a716-446655440000',
    timestamp: new Date().toISOString(),
    version: '1.0.2'
  })
}