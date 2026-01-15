import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/use-auth'
import { act } from 'react'

// Mock fetch
global.fetch = vi.fn()

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock implementation
    ;(global.fetch as any).mockImplementation(() => 
      Promise.resolve({
        ok: false,
        json: async () => ({}),
      })
    )
  })

  describe('initialization', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useAuth())
      
      expect(result.current.isLoading).toBe(true)
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should attempt to refresh auth on mount', async () => {
      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/me',
        expect.objectContaining({
          credentials: 'include',
        })
      )
    })
  })

  describe('login', () => {
    it('should successfully log in a user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user' as const,
        createdAt: new Date(),
      };

      (global.fetch as any).mockImplementation((url: string) => {
        if (url === '/api/auth/me') return Promise.resolve({ ok: false, json: async () => ({}) })
        if (url === '/api/auth/login') return Promise.resolve({ ok: true, json: async () => ({ user: mockUser }) })
        return Promise.resolve({ ok: false, json: async () => ({}) })
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should handle login failure', async () => {
      (global.fetch as any).mockImplementation((url: string) => {
        if (url === '/api/auth/me') return Promise.resolve({ ok: false, json: async () => ({}) })
        if (url === '/api/auth/login') return Promise.resolve({ ok: false, json: async () => ({ error: 'Invalid credentials' }) })
        return Promise.resolve({ ok: false, json: async () => ({}) })
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await expect(
          result.current.login('test@example.com', 'wrongpassword')
        ).rejects.toThrow('Invalid credentials')
      })

      expect(result.current.user).toBeNull()
      expect(result.current.error).toBe('Invalid credentials')
    })

    it('should clear error on clearError call', async () => {
      (global.fetch as any).mockImplementation((url: string) => {
        if (url === '/api/auth/login') return Promise.resolve({ ok: false, json: async () => ({ error: 'Fail' }) })
        return Promise.resolve({ ok: false, json: async () => ({}) })
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        try {
          await result.current.login('', '')
        } catch (e) {
          // ignore
        }
      })

      expect(result.current.error).toBeTruthy()

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('logout', () => {
    it('should successfully log out a user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user' as const,
        createdAt: new Date(),
      };

      (global.fetch as any).mockImplementation((url: string) => {
        if (url === '/api/auth/me') return Promise.resolve({ ok: false, json: async () => ({}) })
        if (url === '/api/auth/login') return Promise.resolve({ ok: true, json: async () => ({ user: mockUser }) })
        if (url === '/api/auth/logout') return Promise.resolve({ ok: true, json: async () => ({ success: true }) })
        return Promise.resolve({ ok: false, json: async () => ({}) })
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })
      expect(result.current.user).toEqual(mockUser)

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should clear user even if logout request fails', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user' as const,
        createdAt: new Date(),
      };

      (global.fetch as any).mockImplementation((url: string) => {
        if (url === '/api/auth/me') return Promise.resolve({ ok: false, json: async () => ({}) })
        if (url === '/api/auth/login') return Promise.resolve({ ok: true, json: async () => ({ user: mockUser }) })
        if (url === '/api/auth/logout') return Promise.reject(new Error('Network error'))
        return Promise.resolve({ ok: false, json: async () => ({}) })
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })
      
      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()
    })
  })
})