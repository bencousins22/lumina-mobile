/**
 * Accessibility Tests
 * 
 * Tests the application for WCAG 2.1 AA compliance using axe-core.
 */

import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Audit @a11y', () => {
  test('login page should have no accessibility violations', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('login page should pass specific WCAG criteria', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('form inputs should have proper labels', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('form')
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('color contrast should meet WCAG AA standards', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['cat.color'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('keyboard navigation should be accessible', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['cat.keyboard'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })
})

test.describe('Screen Reader Compatibility', () => {
  test('important landmarks should be present', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page})
      .withTags(['cat.name-role-value'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('images should have alt text', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['cat.text-alternatives'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })
})
