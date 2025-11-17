import { test, expect } from '@playwright/test';

test.describe('Conair Stage Login Tests', () => {
  test('should authenticate and login to Conair account', async ({ page }) => {
    // Navigate to stage.conair.com with HTTP Basic Auth credentials
    await page.goto('https://storefront:conair1@stage.conair.com');

    // Wait for page to load and log the title for debugging
    await page.waitForLoadState('domcontentloaded');
    console.log('Page title:', await page.title());
    console.log('Page URL:', page.url());

    // Take a screenshot to see what's rendered
    await page.screenshot({ path: 'test-results/conair-homepage.png', fullPage: true });

    // Try to find account link with more flexible selectors
    const accountLink = page.locator('a:has-text("Account"), a:has-text("Sign In"), a:has-text("Login"), [aria-label*="account" i], .account, #account').first();
    
    // Check if link exists before clicking
    if (await accountLink.count() > 0) {
      await accountLink.click();
      
      // Fill in email using multiple possible selectors
      await page.locator('input[type="email"], input[name="email"], input[id*="email"], input[placeholder*="email" i]').first().fill('vladjimir_henry@conair.com');
      
      // Fill in password
      await page.locator('input[type="password"], input[name="password"], input[id*="password"]').first().fill('conair1');
      
      // Click login button
      await page.locator('button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first().click();
      
      // Verify successful login
      await expect(page).toHaveURL(/account|dashboard|profile/i);
    } else {
      // Log available links for debugging
      const allLinks = await page.locator('a').allTextContents();
      console.log('Available links:', allLinks.slice(0, 20));
      throw new Error('Could not find account/login link on page');
    }
  });
});
