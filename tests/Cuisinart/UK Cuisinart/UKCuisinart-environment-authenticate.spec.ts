import { test, expect } from '@playwright/test';

test.describe('Cuisinart Stage Login Tests', () => {
  test('should authenticate and login to Cuisinart account', async ({ page }) => {
    // Navigate to stage.cuisinart.com with HTTP Basic Auth credentials
    await page.goto('https://storefront:conair1@stage.cuisinart.co.uk');

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    console.log('Page title:', await page.title());
    console.log('Page URL:', page.url());

    // Handle OneTrust cookie banner (no popup modal on this site)
    try {
      const acceptButton = page.locator('#onetrust-accept-btn-handler').first();
      await acceptButton.waitFor({ state: 'visible', timeout: 5000 });
      await acceptButton.click();
      console.log('OneTrust "Accept Cookies" banner accepted');
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log('OneTrust banner not found or already dismissed');
    }
  });
});
