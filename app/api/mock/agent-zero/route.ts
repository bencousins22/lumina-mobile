// Mock Agent Zero API endpoint for local development
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(_request: NextRequest) {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Mock Agent Zero backend running'
  })
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint')

  // Mock response for different endpoints
  switch(endpoint) {
    case 'api_message':
      return NextResponse.json({
        context_id: 'mock-context-123',
        response: 'Hello! This is a mock response from the Agent Zero backend. The application is running in local development mode.'
      })
      
    case 'api_log_get':
      return NextResponse.json({
        log: {
          items: [],
          total_items: 0
        }
      })
      
    case 'api_reset_chat':
    case 'api_terminate_chat':
      return NextResponse.json({
        success: true,
        message: 'Operation completed successfully'
      })
      
    case 'api_files_get':
      return NextResponse.json({
        files: {}
      })
      
    default:
      return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 })
  }
}
