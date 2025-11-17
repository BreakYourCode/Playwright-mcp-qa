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
    console.log('Waiting 13 seconds for modal overlay to appear...');
    await page.waitForTimeout(13000);
    
    try {
      // Handle Attentive iframe modal
      const attentiveFrame = page.frameLocator('iframe[src*="attn.tv"]').first();
      const closeButton = attentiveFrame.locator('#closeIconSvg').first();
      await closeButton.waitFor({ timeout: 7000 });
      console.log('Attentive modal found, clicking close button...');
      await closeButton.click();
      console.log('Click executed on modal close button');
      
      // Wait for modal to disappear
      await page.waitForTimeout(2000);
      
      // Verify iframe is gone
      const iframeCount = await page.locator('iframe[src*="attn.tv"]').count();
      if (iframeCount === 0) {
        console.log('Attentive modal overlay successfully closed and removed');
      } else {
        console.log('Attentive modal still present after click attempt');
      }
    } catch (error) {
      console.log('Attentive modal overlay not found or already closed');
    }
  });
});
