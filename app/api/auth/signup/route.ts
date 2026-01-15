/**
 * Signup API Route
 * 
 * Handles user registration using Supabase Auth.
 * Creates a new user account and stores user details.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateTokenPair, getAccessTokenMaxAge, getRefreshTokenMaxAge, getTokenCookieOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s]*[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\s*$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists in Supabase Auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const userExists = existingUsers.users.some((user: any) => user.email === email)

    if (userExists) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: email,
      user_metadata: {
        name: name,
        full_name: name,
      },
    })

    if (authError || !authData.user) {
      console.error('Supabase auth error:', authError)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Create user record in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email || email,
        name: name,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    // Fallback if users table insert fails
    const user = userData || {
      id: authData.user.id,
      email: authData.user.email || email,
      name: name,
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
      message: 'Account created successfully',
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

    return response
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
