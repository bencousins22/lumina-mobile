import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-sm', 'font-bold')
      expect(result).toContain('text-sm')
      expect(result).toContain('font-bold')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn('btn', isActive && 'btn-active')
      expect(result).toContain('btn')
      expect(result).toContain('btn-active')
    })

    it('should ignore falsy values', () => {
      const result = cn('text-sm', false, null, undefined, 'font-bold')
      expect(result).not.toContain('false')
      expect(result).toContain('text-sm')
      expect(result).toContain('font-bold')
    })

    it('should merge tailwind classes intelligently', () => {
      const result = cn('px-2 py-1', 'px-4')
      // Should override px-2 with px-4
      expect(result).toContain('px-4')
      expect(result).toContain('py-1')
    })
  })
})
