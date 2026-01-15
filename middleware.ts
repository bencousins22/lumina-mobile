import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow manifest.json to be accessed without authentication
  if (request.nextUrl.pathname === '/manifest.json') {
    return NextResponse.next()
  }

  // Allow static assets
  if (request.nextUrl.pathname.startsWith('/_next/') || 
      request.nextUrl.pathname.startsWith('/icon') ||
      request.nextUrl.pathname.startsWith('/apple-icon')) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/manifest.json', '/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)']
}
