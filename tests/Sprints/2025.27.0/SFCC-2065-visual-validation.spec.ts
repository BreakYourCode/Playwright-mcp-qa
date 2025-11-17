import { test, expect } from '@playwright/test';

/**
 * SFCC-2065: Visual Validation with Screenshots
 * 
 * This test captures screenshots with bounding boxes around validated cart images
 * to visually demonstrate compliance with accessibility requirements.
 */

test.describe('SFCC-2065: Visual Validation', () => {
  const baseURL = 'https://storefront:conair1@dev.babylisspro.com';
  
  test('Visual validation: Highlight cart images with empty alt attributes', async ({ page }) => {
    // Navigate to product page
    await page.goto(`${baseURL}/italian-hair-dryer-diffuser/BABDF2.html`);
    await page.waitForLoadState('domcontentloaded');
    
    // Handle OneTrust banner
    try {
      const acceptButton = page.locator('#onetrust-accept-btn-handler').first();
      await acceptButton.waitFor({ state: 'visible', timeout: 5000 });
      await acceptButton.click();
      await page.waitForTimeout(1000);
    } catch (e) {
      // Banner not present
    }

    // Add product to cart
    await page.getByRole('button', { name: 'Add To Cart, BaBylissPRO®' }).click();
    await page.waitForTimeout(2000);

    // Navigate to cart
    await Promise.all([
      page.waitForNavigation(),
      page.locator('div.b-header-minicart path').first().click()
    ]);
    await page.waitForLoadState('domcontentloaded');

    // Inject CSS to highlight validated images with green boxes
    await page.addStyleTag({
      content: `
        .validation-box {
          outline: 4px solid #00ff00 !important;
          outline-offset: 4px !important;
          box-shadow: 0 0 15px rgba(0, 255, 0, 0.5) !important;
          position: relative !important;
        }
        .validation-label {
          position: absolute !important;
          top: -30px !important;
          left: 0 !important;
          background: #00ff00 !important;
          color: #000 !important;
          padding: 4px 8px !important;
          font-size: 12px !important;
          font-weight: bold !important;
          border-radius: 3px !important;
          z-index: 10000 !important;
        }
        .cart-item-box {
          outline: 2px dashed #0080ff !important;
          outline-offset: 8px !important;
          position: relative !important;
        }
      `
    });

    // Find all cart items and their images
    const cartItems = await page.locator('.cart-item, .line-item, [class*="product-line-item"]').all();
    
    let validationCount = 0;

    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      
      // Add blue box around entire cart item
      await item.evaluate((el, index) => {
        el.classList.add('cart-item-box');
        el.setAttribute('data-cart-item', `${index + 1}`);
      }, i);
      
      const images = await item.locator('img').all();
      
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        
        // Highlight images with empty alt (compliant)
        if (alt === '') {
          validationCount++;
          await img.evaluate((el, count) => {
            el.classList.add('validation-box');
            const label = document.createElement('div');
            label.className = 'validation-label';
            label.textContent = `✓ VALIDATED #${count}: alt=""`;
            el.parentElement?.style.setProperty('position', 'relative', 'important');
            el.parentElement?.appendChild(label);
          }, validationCount);
        }
      }
    }

    console.log(`✓ Highlighted ${validationCount} validated cart images with empty alt attributes`);

    // Take screenshot with highlights
    await page.screenshot({ 
      path: 'test-results/SFCC-2065-visual-validation.png',
      fullPage: true 
    });

    console.log('✓ Screenshot saved: test-results/SFCC-2065-visual-validation.png');

    expect(validationCount).toBeGreaterThan(0);
  });
});
