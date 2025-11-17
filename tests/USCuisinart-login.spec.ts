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

    // Wait for modal overlay to appear (appears after ~13 seconds)
    try {
      const modalClose = page.locator('button.close, button[aria-label*="close" i], button:has-text("×"), .modal-close, [data-dismiss="modal"]').first();
      await modalClose.waitFor({ timeout: 20000 });
      await modalClose.click();
      console.log('Modal overlay closed');
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log('Modal overlay not found or already closed');
    }
  });
});
