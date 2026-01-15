/**
 * Authentication Utilities
 *  
 * Provides JWT-based authentication utilities for secure user authentication.
 * Tokens are stored in httpOnly cookies for security.
 */

import { jwtVerify, SignJWT } from 'jose'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  createdAt: Date
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface TokenPayload extends Record<string, unknown> {
  userId: string
  email: string
  name: string
  role: 'admin' | 'user'
  type: 'access' | 'refresh'
  iat?: number
  exp?: number
}

// Get JWT secret from environment or use default for development
const getSecret = () => {
  const secret = process.env.JWT_SECRET || 'lumina-dev-secret-change-in-production'
  return new TextEncoder().encode(secret)
}

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m' // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d' // 7 days

/**
 * Generate a JWT access token
 */
export async function generateAccessToken(user: Omit<User, 'createdAt'>): Promise<string> {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    type: 'access',
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(getSecret())

  return token
}

/**
 * Generate a JWT refresh token
 */
export async function generateRefreshToken(user: Omit<User, 'createdAt'>): Promise<string> {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    type: 'refresh',
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(getSecret())

  return token
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as TokenPayload
  } catch (error) {
    // Token is invalid or expired
    return null
  }
}

/**
 * Generate both access and refresh tokens
 */
export async function generateTokenPair(user: Omit<User, 'createdAt'>): Promise<AuthTokens> {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(user),
    generateRefreshToken(user),
  ])

  return { accessToken, refreshToken }
}

/**
 * Extract token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null
  
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  
  return parts[1]
}

/**
 * Cookie options for secure token storage
 */
export function getTokenCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
    path: '/',
  }
}

/**
 * Get maximum age for access token cookie (15 minutes in seconds)
 */
export function getAccessTokenMaxAge(): number {
  return 15 * 60 // 15 minutes
}

/**
 * Get maximum age for refresh token cookie (7 days in seconds)
 */
export function getRefreshTokenMaxAge(): number {
  return 7 * 24 * 60 * 60 // 7 days
}
