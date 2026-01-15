import { test, expect } from '@playwright/test';
import { chromium } from 'playwright';

// Performance test suite for Agent Zero mobile frontend
test.describe('Agent Zero Mobile Performance Tests', () => {
  let browser;
  let page;
  let context;

  test.beforeAll(async () => {
    // Launch browser with performance monitoring
    browser = await chromium.launch({
      headless: true,
      args: ['--enable-features=NetworkService,NetworkServiceInProcess']
    });
    context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test('Loading Performance - Measure initial page load time', async () => {
    const startTime = Date.now();
    const response = await page.goto('http://localhost:3000');
    const endTime = Date.now();
    
    const loadTime = endTime - startTime;
    console.log(`Initial page load time: ${loadTime}ms`);
    
    // Performance budget: should load under 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  test('Rendering Performance - Measure time to interactive', async () => {
    await page.goto('http://localhost:3000');
    
    // Measure time to interactive
    const startTime = Date.now();
    await page.waitForFunction(() => {
      return document.readyState === 'complete' &&
             window.performance.timing.domInteractive > 0;
    });
    const endTime = Date.now();
    
    const timeToInteractive = endTime - startTime;
    console.log(`Time to interactive: ${timeToInteractive}ms`);
    
    // Performance budget: should be interactive under 1.5 seconds
    expect(timeToInteractive).toBeLessThan(1500);
  });

  test('Memory Usage - Measure memory consumption', async () => {
    await page.goto('http://localhost:3000');
    
    // Get memory usage
    const metrics = await page.metrics();
    console.log('Memory metrics:', metrics);
    
    // Check JavaScript heap size
    const jsHeapSize = metrics.JSHeapUsedSize / 1024 / 1024; // Convert to MB
    console.log(`JavaScript heap used: ${jsHeapSize.toFixed(2)} MB`);
    
    // Memory budget: should use less than 50MB
    expect(jsHeapSize).toBeLessThan(50);
  });

  test('Network Performance - Measure API call efficiency', async () => {
    // Enable request tracking
    await page.route('**/api/**', route => {
      const startTime = Date.now();
      route.continue().then(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        console.log(`API call duration: ${duration}ms for ${route.request().url()}`);
      });
    });

    await page.goto('http://localhost:3000');
    
    // Wait for network to be idle
    await page.waitForLoadState('networkidle');
    
    // Get all requests
    const requests = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(entry => ({
        name: entry.name,
        duration: entry.duration,
        transferSize: entry.transferSize
      }));
    });
    
    console.log('Network requests:', requests);
    
    // Performance budget: API calls should complete under 500ms
    const apiRequests = requests.filter(r => r.name.includes('/api/'));
    apiRequests.forEach(request => {
      expect(request.duration).toBeLessThan(500);
    });
  });

  test('Battery Impact - Measure CPU usage patterns', async () => {
    await page.goto('http://localhost:3000');
    
    // Measure CPU usage over time
    const cpuMeasurements = [];
    for (let i = 0; i < 5; i++) {
      const metrics = await page.metrics();
      cpuMeasurements.push(metrics.TaskDuration);
      await page.waitForTimeout(1000); // Wait 1 second between measurements
    }
    
    const avgCpuUsage = cpuMeasurements.reduce((a, b) => a + b, 0) / cpuMeasurements.length;
    console.log(`Average CPU task duration: ${avgCpuUsage}ms`);
    
    // Battery impact budget: CPU usage should be optimized
    expect(avgCpuUsage).toBeLessThan(100); // Less than 100ms average CPU task duration
  });

  test('Robustness - Test error handling and recovery', async () => {
    // Test network error recovery
    await page.route('**/api/auth/me', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.goto('http://localhost:3000');
    
    // Wait for error handling
    await page.waitForTimeout(2000);
    
    // Check if error is handled gracefully
    const errorElements = await page.$$('.error-message');
    expect(errorElements.length).toBeGreaterThan(0);
    
    // Test recovery by restoring normal API response
    await page.route('**/api/auth/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { name: 'Test User' } })
      });
    });

    // Reload and check recovery
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const userElements = await page.$$('.user-info');
    expect(userElements.length).toBeGreaterThan(0);
  });

  test('Stress Test - Measure performance under load', async () => {
    // Create multiple pages to simulate concurrent users
    const pages = [];
    for (let i = 0; i < 3; i++) {
      const newPage = await context.newPage();
      await newPage.goto('http://localhost:3000');
      pages.push(newPage);
    }

    // Measure performance under load
    const startTime = Date.now();
    await Promise.all(pages.map(page => page.waitForLoadState('networkidle')));
    const endTime = Date.now();
    
    const loadTimeUnderStress = endTime - startTime;
    console.log(`Load time under stress (3 concurrent users): ${loadTimeUnderStress}ms`);
    
    // Performance budget under stress: should still load under 4 seconds
    expect(loadTimeUnderStress).toBeLessThan(4000);

    // Clean up
    await Promise.all(pages.map(page => page.close()));
  });
});
