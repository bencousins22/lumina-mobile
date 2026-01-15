import { describe, it, expect } from 'vitest'
import { 
  validatePassword, 
  checkCommonPatterns,
  getStrengthColor,
  getStrengthProgress
} from '@/lib/password-validator'

describe('password-validator', () => {
  describe('validatePassword', () => {
    it('should reject password that is too short', () => {
      const result = validatePassword('Abc123!')
      expect(result.isValid).toBe(false)
      expect(result.feedback).toContain('Must be at least 8 characters')
      expect(result.strength).toBe('very weak')
    })

    it('should reject password without uppercase', () => {
      const result = validatePassword('abc123!@#')
      expect(result.isValid).toBe(false)
      expect(result.feedback).toContain('Must contain at least one uppercase letter (A-Z)')
    })

    it('should reject password without lowercase', () => {
      const result = validatePassword('ABC123!@#')
      expect(result.isValid).toBe(false)
      expect(result.feedback).toContain('Must contain at least one lowercase letter (a-z)')
    })

    it('should reject password without numbers', () => {
      const result = validatePassword('Abcdefgh!')
      expect(result.isValid).toBe(false)
      expect(result.feedback).toContain('Must contain at least one number (0-9)')
    })

    it('should reject password without special characters', () => {
      const result = validatePassword('Abcdefgh1')
      expect(result.isValid).toBe(false)
      expect(result.feedback).toContain('Must contain at least one special character')
    })

    it('should accept valid strong password', () => {
      const result = validatePassword('MyP@ssw0rd!')
      expect(result.isValid).toBe(true)
      expect(result.feedback).toHaveLength(0)
      expect(result.strength).toBe('strong')
      expect(result.score).toBe(4)
    })

    it('should give higher score for longer passwords', () => {
      const shortValid = validatePassword('Abc123!@')
      const longValid = validatePassword('Abc123!@#$SecurePass')
      
      expect(shortValid.isValid).toBe(true)
      expect(longValid.isValid).toBe(true)
      expect(longValid.score).toBeGreaterThanOrEqual(shortValid.score)
    })

    it('should provide appropriate strength levels', () => {
      const veryWeak = validatePassword('abc')
      const weak = validatePassword('abcdefgh')
      const fair = validatePassword('Abcdefgh')
      const good = validatePassword('Abcdefgh1')
      const strong = validatePassword('Abcdefgh1!')

      expect(veryWeak.strength).toBe('very weak')
      expect(weak.strength).toBe('weak')
      expect(fair.strength).toBe('fair')
      expect(good.strength).toBe('good')
      expect(strong.strength).toBe('strong')
    })
  })

  describe('checkCommonPatterns', () => {
    it('should detect sequential characters', () => {
      const warnings = checkCommonPatterns('Pabc123!')
      expect(warnings).toContain('Avoid sequential characters (abc, 123, etc.)')
    })

    it('should detect repeated characters', () => {
      const warnings = checkCommonPatterns('Paaawd123!')
      expect(warnings).toContain('Avoid repeated characters (aaa, 111, etc.)')
    })

    it('should detect common words', () => {
      const passwordWarnings = checkCommonPatterns('MyPassword123!')
      const adminWarnings = checkCommonPatterns('Admin@123')
      const luminaWarnings = checkCommonPatterns('Lumina!123')

      expect(passwordWarnings.length).toBeGreaterThan(0)
      expect(adminWarnings.length).toBeGreaterThan(0)
      expect(luminaWarnings.length).toBeGreaterThan(0)
    })

    it('should return empty array for good passwords', () => {
      const warnings = checkCommonPatterns('S#cure!P4ssw0rd')
      expect(warnings).toHaveLength(0)
    })
  })

  describe('getStrengthColor', () => {
    it('should return correct colors for each strength level', () => {
      expect(getStrengthColor('very weak')).toBe('text-destructive')
      expect(getStrengthColor('weak')).toBe('text-orange-500')
      expect(getStrengthColor('fair')).toBe('text-yellow-500')
      expect(getStrengthColor('good')).toBe('text-blue-500')
      expect(getStrengthColor('strong')).toBe('text-green-500')
    })
  })

  describe('getStrengthProgress', () => {
    it('should return correct progress percentage', () => {
      expect(getStrengthProgress(0)).toBe(0)
      expect(getStrengthProgress(1)).toBe(25)
      expect(getStrengthProgress(2)).toBe(50)
      expect(getStrengthProgress(3)).toBe(75)
      expect(getStrengthProgress(4)).toBe(100)
    })
  })
})
