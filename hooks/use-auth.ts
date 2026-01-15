/**
 * Authentication Hook
 * 
 * Provides authentication state and methods for the application.
 * Handles login, logout, token refresh, and user state management.
 */

import { useState, useEffect, useCallback } from 'react'
import type { User } from '@/lib/auth'

export interface UseAuthReturn {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  clearError: () => void
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Clear any error messages
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Refresh authentication state from the server
   */
  const refreshAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Include cookies
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Failed to refresh auth:', err)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, []) // Empty dependency array since it doesn't depend on any external values

  /**
   * Log in with email and password
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      setUser(data.user)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Log out the current user
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      setUser(null)
    } catch (err) {
      console.error('Logout failed:', err)
      // Still clear user state even if request fails
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Auto-refresh authentication on mount
   */
  useEffect(() => {
    refreshAuth()
  }, [refreshAuth])

  /**
   * Set up automatic token refresh
   * Refresh access token 1 minute before it expires (14 minutes after login)
   */
  useEffect(() => {
    if (!user) return

    const refreshInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        })

        if (!response.ok) {
          // Refresh failed, user needs to log in again
          console.error('Token refresh failed')
          setUser(null)
        }
      } catch (err) {
        console.error('Token refresh error:', err)
        setUser(null)
      }
    }, 14 * 60 * 1000) // 14 minutes

    return () => clearInterval(refreshInterval)
  }, [user])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    logout,
    refreshAuth,
    clearError,
  }
}
