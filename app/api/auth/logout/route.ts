/**
 * Logout API Route
 * 
 * Handles user logout and clears authentication cookies.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut()

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })

    // Clear all auth cookies
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')
    response.cookies.delete('sb_access_token')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
