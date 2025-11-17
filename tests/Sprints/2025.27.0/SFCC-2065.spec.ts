import { test, expect } from '@playwright/test';

/**
 * SFCC-2065: [ADA] [Sev 10] Ensure images provide informative alternative text
 * 
 * Ticket: https://jira.example.com/browse/SFCC-2065
 * Priority: High
 * Sprint: SourceMash 2025.27
 * Status: 12 - Dev QA Conair
 * 
 * Requirements:
 * - Product images in cart must have alt="" (empty - decorative context)
 * - Product name is displayed as text, making images decorative
 * - Images should not be announced by screen readers in cart context
 * 
 * Scope: Cart page product images only (not site-wide logos, icons, etc.)
 * Test Environment: DEV (https://storefront:conair1@dev.babylisspro.com/cart)
 */

test.describe('SFCC-2065: Image Alt Text Accessibility', () => {
  const baseURL = 'https://storefront:conair1@dev.babylisspro.com';
  
  test.beforeEach(async ({ page }) => {
    // Navigate to product page to add item to cart
    await page.goto(`${baseURL}/italian-hair-dryer-diffuser/BABDF2.html`);
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    
    // Handle OneTrust cookie banner (no popup modal on this site)
    try {
      const acceptButton = page.locator('#onetrust-accept-btn-handler').first();
      await acceptButton.waitFor({ state: 'visible', timeout: 5000 });
      await acceptButton.click();
      await page.waitForTimeout(1000);
    } catch (e) {
      // Banner not present, continue
    }

    // Add product to cart
    await page.getByRole('button', { name: 'Add To Cart, BaBylissPRO®' }).click();
    await page.waitForTimeout(2000); // Wait for add to cart action to complete

    // Click mini cart icon to navigate to cart page
    await Promise.all([
      page.waitForNavigation(),
      page.locator('div.b-header-minicart path').first().click()
    ]);
    await page.waitForLoadState('domcontentloaded');

    // Confirm product is in cart page
    const cartContent = await page.locator('.cart-content, .cart-page, main').textContent();
    expect(cartContent).toContain('BaBylissPRO® Italian Dryer Diffuser');
    console.log('✓ Product confirmed in cart page - ready for validation');
  });

  test('1.1 - Product images in cart should have empty alt (decorative)', async ({ page }) => {
    /**
     * Test Case: Cart product images are decorative (product name is already in text)
     * Expected: Product thumbnails in cart have alt=""
     * Scope: Only images within cart line items
     */
    
    // Locate cart line items
    const cartItems = await page.locator('.cart-item, .line-item, [class*="product-line-item"]').all();
    
    if (cartItems.length === 0) {
      console.log('⚠️  Cart is empty - add products to fully test this scenario');
      test.skip();
    }

    console.log(`Found ${cartItems.length} cart item(s)`);

    const productImageIssues: string[] = [];

    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      const productImages = await item.locator('img').all();
      
      for (const img of productImages) {
        const alt = await img.getAttribute('alt');
        const src = await img.getAttribute('src');
        const className = await img.getAttribute('class');

        // In cart context, product images are decorative because product name is displayed
        if (alt !== '') {
          productImageIssues.push(
            `Cart item ${i + 1}: Product image should have alt="" (decorative). ` +
            `Current alt="${alt}", class="${className}", src="${src?.substring(0, 60)}"`
          );
        } else {
          console.log(`✓ Cart item ${i + 1}: Product image correctly has empty alt`);
        }
      }
    }

    if (productImageIssues.length > 0) {
      console.log('\nProduct images in cart with non-empty alt:');
      productImageIssues.forEach(issue => console.log(`  ❌ ${issue}`));
    }

    expect(productImageIssues.length).toBe(0);
  });

  test('1.2 - Verify cart images have proper HTML structure', async ({ page }) => {
    /**
     * Test Case: Verify HTML follows compliant code example
     * Expected: Cart product images match structure from SFCC-2065 ticket
     * Scope: Only images within cart line items
     */
    
    const cartItems = await page.locator('.cart-item, .line-item, [class*="product-line-item"]').all();
    const codeIssues: string[] = [];

    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      const images = await item.locator('img').all();

      for (const img of images) {
        const outerHTML = await img.evaluate(el => el.outerHTML);
        const alt = await img.getAttribute('alt');
        const src = await img.getAttribute('src');

        // Check for common anti-patterns
        if (alt === null) {
          codeIssues.push(`Cart item ${i + 1}: Missing alt attribute entirely. HTML: ${outerHTML.substring(0, 100)}`);
        }
        
        if (alt && (alt.includes('image') || alt.includes('picture') || alt.includes('photo')) && !alt.includes(' ')) {
          codeIssues.push(`Cart item ${i + 1}: Generic alt text detected: "${alt}"`);
        }

        // Check for file name as alt text (bad practice)
        if (alt && src && alt.toLowerCase().includes(src.split('/').pop()?.split('.')[0].toLowerCase() || '___')) {
          codeIssues.push(`Cart item ${i + 1}: Alt text appears to be filename: "${alt}"`);
        }
      }
    }

    if (codeIssues.length > 0) {
      console.log('\nCode structure issues in cart:');
      codeIssues.forEach(issue => console.log(`  ⚠️  ${issue}`));
    }

    expect(codeIssues.length).toBe(0);
  });

  test('2.1 - Screen reader simulation: cart images should not be announced', async ({ page }) => {
    /**
     * Test Case: Simulate screen reader experience for cart images
     * Expected: Decorative product images in cart are skipped by accessibility tree
     * Scope: Only cart line items
     */
    
    // Get accessibility snapshot
    const snapshot = await page.accessibility.snapshot();
    
    // Helper function to traverse accessibility tree and find images
    function findImagesInTree(node: any, images: any[] = []): any[] {
      if (node.role === 'img') {
        images.push({
          name: node.name,
          role: node.role,
          description: node.description,
        });
      }
      
      if (node.children) {
        for (const child of node.children) {
          findImagesInTree(child, images);
        }
      }
      
      return images;
    }

    const accessibleImages = findImagesInTree(snapshot || {});
    console.log(`\nImages visible to screen readers on cart page: ${accessibleImages.length}`);
    
    if (accessibleImages.length > 0) {
      console.log('Accessible images found:');
      accessibleImages.forEach((img, idx) => {
        console.log(`  ${idx + 1}. "${img.name || '(no name)'}"`);
      });
    }

    // Count images within cart items specifically
    const cartItems = await page.locator('.cart-item, .line-item, [class*="product-line-item"]').all();
    let totalCartImages = 0;
    
    for (const item of cartItems) {
      const images = await item.locator('img').count();
      totalCartImages += images;
    }

    console.log(`Total product images in cart: ${totalCartImages}`);
    console.log(`Cart product images hidden from screen readers: ${totalCartImages - accessibleImages.filter(img => img.name?.includes('BaBylissPRO')).length}`);

    // Product images in cart should be hidden (decorative), so accessible images should be minimal
    // Allowing for payment/security badges that might be informative
    expect(accessibleImages.length).toBeLessThanOrEqual(5);
  });

  test('3.1 - Generate accessibility report for cart images', async ({ page }) => {
    /**
     * Test Case: Comprehensive audit of cart product images
     * Expected: Generate detailed report for manual review
     * Scope: Only images within cart line items
     */
    
    const cartItems = await page.locator('.cart-item, .line-item, [class*="product-line-item"]').all();
    const imageReport: any[] = [];

    console.log(`\n=== CART IMAGE ACCESSIBILITY REPORT ===`);
    console.log(`Total cart items: ${cartItems.length}\n`);

    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      const images = await item.locator('img').all();
      
      for (let j = 0; j < images.length; j++) {
        const img = images[j];
        const src = await img.getAttribute('src');
        const alt = await img.getAttribute('alt');
        const className = await img.getAttribute('class');
        const role = await img.getAttribute('role');
        const ariaHidden = await img.getAttribute('aria-hidden');
        
        imageReport.push({
          cartItem: i + 1,
          imageIndex: j + 1,
          src: src?.substring(0, 60) || 'N/A',
          alt: alt !== null ? (alt === '' ? '(empty)' : alt) : '(missing)',
          class: className || 'N/A',
          role: role || 'N/A',
          ariaHidden: ariaHidden || 'N/A',
          compliant: alt === '', // In cart context, should be empty (decorative)
        });
      }
    }

    console.log(`Total product images analyzed: ${imageReport.length}`);
    console.log(`Compliant (empty alt): ${imageReport.filter(r => r.compliant).length}`);
    console.log(`Non-compliant (has alt text): ${imageReport.filter(r => !r.compliant).length}\n`);
    
    console.log('Detailed Report:');
    imageReport.forEach(item => {
      const status = item.compliant ? '✅' : '❌';
      console.log(`${status} Cart Item ${item.cartItem}, Image ${item.imageIndex}: alt="${item.alt}" | class="${item.class}" | src="${item.src}"`);
    });

    // Assert at least one image was found
    expect(imageReport.length).toBeGreaterThan(0);
    
    // Calculate compliance percentage
    const complianceRate = (imageReport.filter(r => r.compliant).length / imageReport.length) * 100;
    console.log(`\nCart Image Compliance Rate: ${complianceRate.toFixed(1)}%`);
    
    // Expect 100% compliance for cart images (should all be decorative with empty alt)
    expect(complianceRate).toBe(100);
  });

  test('4.1 - Regression check: cart image accessibility baseline', async ({ page }) => {
    /**
     * Test Case: Establish baseline for cart image accessibility
     * Expected: Track compliance metrics over time
     * Scope: Only cart line items
     */
    
    const cartItems = await page.locator('.cart-item, .line-item, [class*="product-line-item"]').all();
    let totalCartImages = 0;
    let compliantCartImages = 0;

    for (const item of cartItems) {
      const images = await item.locator('img').all();
      
      for (const img of images) {
        totalCartImages++;
        const alt = await img.getAttribute('alt');
        
        // In cart context, images should have empty alt (decorative)
        if (alt === '') {
          compliantCartImages++;
        }
      }
    }

    const complianceRate = totalCartImages > 0 ? (compliantCartImages / totalCartImages) * 100 : 0;

    console.log('\n=== CART IMAGE COMPLIANCE BASELINE ===');
    console.log(`Cart Items: ${cartItems.length}`);
    console.log(`Total Cart Images: ${totalCartImages}`);
    console.log(`Compliant (empty alt): ${compliantCartImages}`);
    console.log(`Compliance Rate: ${complianceRate.toFixed(1)}%`);
    
    // Store baseline for future comparison
    const baseline = {
      timestamp: new Date().toISOString(),
      url: page.url(),
      cartItems: cartItems.length,
      totalCartImages: totalCartImages,
      compliantImages: compliantCartImages,
      complianceRate: complianceRate,
    };

    console.log('\nBaseline Data:');
    console.log(JSON.stringify(baseline, null, 2));

    // Assert minimum compliance threshold (expect 100% for cart images)
    expect(complianceRate).toBeGreaterThanOrEqual(100);
  });
});
