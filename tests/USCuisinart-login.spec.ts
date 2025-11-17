import { test, expect } from '@playwright/test';

test.describe('Cuisinart Stage Login Tests', () => {
  test('should authenticate and login to Cuisinart account', async ({ page }) => {
    // Navigate to stage.cuisinart.com with HTTP Basic Auth credentials
    await page.goto('https://storefront:conair1@stage.cuisinart.com');

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    console.log('Page title:', await page.title());
    console.log('Page URL:', page.url());

    // Handle OneTrust cookie banner if it appears
    try {
      const oneTrustBanner = page.locator('#onetrust-accept-btn-handler, button:has-text("Accept All Cookies"), button:has-text("Accept Cookies")');
      await oneTrustBanner.waitFor({ timeout: 5000 });
      await oneTrustBanner.click();
      console.log('OneTrust banner accepted');
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log('OneTrust banner not found or already dismissed');
    }

    // Handle modal overlay if it appears (newsletter signup, promotion, etc.)
    try {
      const modalClose = page.locator('button.close, button[aria-label*="close" i], button:has-text("×"), .modal-close, [data-dismiss="modal"]').first();
      await modalClose.waitFor({ timeout: 5000 });
      await modalClose.click();
      console.log('Modal overlay closed');
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log('Modal overlay not found or already closed');
    }

    // Click account/login link
    const accountLink = page.locator('a:has-text("Account"), a:has-text("Sign In"), a:has-text("Login"), [aria-label*="account" i]').first();
    
    if (await accountLink.count() > 0) {
      await accountLink.click();
      
      // Wait a moment for modal/page to load
      await page.waitForTimeout(2000);
      
      // Fill in email
      await page.locator('input[type="email"], input[name="email"]').first().fill('vladjimir_henry@conair.com');
      
      // Fill in password
      await page.locator('input[type="password"], input[name="password"]').first().fill('conair1');
      
      // Click login button specifically within the #loginModal
      await page.getByRole('button', { name: 'Sign in', exact: true }).click();
      
      // Wait for navigation
      await page.waitForLoadState('networkidle');
      
      // Verify successful login by checking for logged-in user elements
      // Could be: account name, logout button, or "My Account" link
      const loggedInIndicator = page.locator('.user-message, .user-name, a:has-text("Log Out"), a:has-text("Logout"), [data-logged-in="true"]').first();
      await expect(loggedInIndicator).toBeVisible({ timeout: 10000 });
      
      console.log('Login successful! URL:', page.url());
    } else {
      const allLinks = await page.locator('a').allTextContents();
      console.log('Available links:', allLinks.slice(0, 20));
      throw new Error('Could not find account/login link on page');
    }
  });
});
