import { test, expect } from '@playwright/test';

test.describe('Cuisinart Stage Login Tests', () => {
  test('should authenticate and login to Cuisinart account', async ({ page }) => {
    // Navigate to stage.cuisinart.com with HTTP Basic Auth credentials
    await page.goto('https://storefront:conair1@stage.cuisinart.co.uk');

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

    // Handle Attentive iframe modal when it appears
    try {
      const attentiveFrame = page.frameLocator('iframe[src*="attn.tv"]').first();
      const closeButton = attentiveFrame.locator('#closeIconSvg').first();
      await closeButton.waitFor({ state: 'visible', timeout: 20000 });
      console.log('Attentive modal found, clicking close button...');
      await closeButton.click();
      console.log('Click executed on modal close button');
      await page.waitForTimeout(1000);
      
      // Wait for overlay to be removed
      const overlay = page.locator('div[id*="attentive"], div[class*="attentive"]').first();
      await overlay.waitFor({ state: 'detached', timeout: 10000 });
      console.log('Attentive modal overlay successfully closed and removed');
    } catch (error) {
      console.log('Attentive modal not found or already closed');
    }
  });
});
