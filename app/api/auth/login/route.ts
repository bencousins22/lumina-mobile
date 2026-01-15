/**
 * Login API Route
 * 
 * Handles user authentication using Supabase Auth.
 * Stores tokens in httpOnly cookies for security.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateTokenPair, getAccessTokenMaxAge, getRefreshTokenMaxAge, getTokenCookieOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Fetch user details from the users table if you have additional user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('id', authData.user.id)
      .single()

    // If no user record exists, create one with default values
    const user = userData || {
      id: authData.user.id,
      email: authData.user.email || email,
      name: authData.user.user_metadata?.name || email.split('@')[0],
      role: 'user' as const,
    }

    // Generate JWT tokens for our app
    const { accessToken, refreshToken } = await generateTokenPair({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: new Date(),
      },
    })

    // Set tokens as httpOnly cookies
    response.cookies.set(
      'access_token',
      accessToken,
      getTokenCookieOptions(getAccessTokenMaxAge())
    )

    response.cookies.set(
      'refresh_token',
      refreshToken,
      getTokenCookieOptions(getRefreshTokenMaxAge())
    )

    // Also store Supabase session
    if (authData.session) {
      response.cookies.set(
        'sb_access_token',
        authData.session.access_token,
        getTokenCookieOptions(authData.session.expires_in || 3600)
      )
    }

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
