/**
 * Token Refresh API Route
 * 
 * Refreshes the access token using the refresh token.
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, generateAccessToken, getAccessTokenMaxAge, getTokenCookieOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      )
    }

    // Verify refresh token
    const payload = await verifyToken(refreshToken)

    if (!payload || payload.type !== 'refresh') {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      )
    }

    // Generate new access token
    const newAccessToken = await generateAccessToken({
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    })

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
    })

    // Update access token cookie
    response.cookies.set(
      'access_token',
      newAccessToken,
      getTokenCookieOptions(getAccessTokenMaxAge())
    )

    return response
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
