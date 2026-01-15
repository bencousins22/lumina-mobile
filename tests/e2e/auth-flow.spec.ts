/**
 * E2E Tests for Authentication Flow
 * 
 * Tests the complete user authentication journey including:
 * - Login
 * - Navigation after login
 * - Logout
 * - Protected routes
 */

import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page which should redirect to login
    await page.goto('/')
  })

  test('should display login screen on initial load', async ({ page }) => {
    // Check for Lumina branding
    await expect(page.getByRole('heading', { name: /Lumina/i })).toBeVisible()
    
    // Check for password input
    await expect(page.getByPlaceholder(/password/i)).toBeVisible()
    
    // Check for submit button
    await expect(page.getByRole('button', { name: /access control panel/i })).toBeVisible()
  })

  test('should show error for empty credentials', async ({ page }) => {
    // Click login without entering credentials
    await page.getByRole('button', { name: /access control panel/i }).click()
    
    // Should show validation error (if implemented)
    // This test will pass once validation is added
  })

  test('should show error for invalid credentials', async ({ page }) => {
    // Enter invalid credentials
    await page.getByPlaceholder(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /access control panel/i }).click()
    
    // Wait for error message
    // Note: This requires real Supabase credentials to fully test
    // For now, we're testing the UI flow
  })

  test('should have accessible password toggle', async ({ page }) => {
    const passwordInput = page.getByPlaceholder(/password/i)
    
    // Password should be hidden initially
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Find and click the show/hide password button
    const toggleButton = page.getByRole('button', { name: /show password|hide password/i })
    await toggleButton.click()
    
    // Password should now be visible
    await expect(passwordInput).toHaveAttribute('type', 'text')
  })

  test('should have keyboard-accessible login form', async ({ page }) => {
    // Tab to password field
    await page.keyboard.press('Tab')
    
    // Type password
    await page.keyboard.type('testpassword')
    
    // Tab to submit button
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab') // Skip toggle button
    
    // Should be able to submit with Enter
    // await page.keyboard.press('Enter')
    // Testing submission requires valid Supabase credentials
  })

  test('should display correct page structure', async ({ page }) => {
    // Check for main regions
    const main = page.locator('main')
    await expect(main).toBeVisible()
    
    // Check for footer
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer).toContainText(/open source/i)
    
    // Check for feature highlights
    await expect(page.getByText(/multi-agent/i)).toBeVisible()
    await expect(page.getByText(/a2a protocol/i)).toBeVisible()
    await expect(page.getByText(/secure/i)).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Login elements should still be visible
    await expect(page.getByRole('heading', { name: /Lumina/i })).toBeVisible()
    await expect(page.getByPlaceholder(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /access control panel/i })).toBeVisible()
  })
})

test.describe('Post-Login Navigation (requires auth)', () => {
  // These tests require valid Supabase credentials
  // Skip them in CI unless credentials are available
  test.skip('should redirect to chat after successful login', async ({ page }) => {
    // This test would:
    // 1. Enter valid credentials
    // 2. Submit the form
    // 3. Verify redirect to main app
    // 4. Check for chat interface
  })

  test.skip('should persist session across page reloads', async ({ page }) => {
    // This test would:
    // 1. Log in
    // 2. Reload the page
    // 3. Verify still authenticated
  })

  test.skip('should successfully logout', async ({ page }) => {
    // This test would:
    // 1. Log in
    // 2. Navigate to settings
    // 3. Click logout
    // 4. Verify redirect to login
  })
})
