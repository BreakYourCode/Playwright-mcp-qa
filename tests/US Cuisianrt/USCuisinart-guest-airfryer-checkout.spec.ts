import { test, expect } from '@playwright/test';

test.describe('US Cuisinart Guest Air Fryer Checkout Tests', () => {
  test('should complete guest checkout with air fryer product', async ({ page }) => {
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

    // TODO: Add air fryer product search and checkout steps
    console.log('Ready to start air fryer checkout flow');
    
    // Navigate to Appliances > Air Fryers
    console.log('Clicking Appliances menu to open submenu...');
    const appliancesMenu = page.locator('div.menu-group > ul > li:nth-of-type(1) > a');
    await appliancesMenu.click();
    await page.waitForTimeout(1000);
    
    console.log('Clicking Air Fryers...');
    await page.locator('#appliances_airfryers, a:has-text("Air Fryers")').first().click();
    await page.waitForLoadState('networkidle');
    console.log('Air Fryers page loaded');
    
    // Verify Air Fryers page loaded correctly
    await expect(page).toHaveURL(/air-fryers/i);
    await expect(page.locator('h1, .page-title')).toContainText(/air fryer/i, { timeout: 5000 });
    console.log('✓ Air Fryers category page verified');
    
    // Select Air Fryer Toaster Oven with Grill - White color
    console.log('Selecting white color variant...');
    await page.locator('div.col-sm-12 li:nth-of-type(3) span').click();
    await page.waitForTimeout(1000);
    
    console.log('Clicking on Air Fryer Toaster Oven with Grill product...');
    const productCard = page.locator('div:nth-of-type(7) div.product-card__img img');
    await expect(productCard).toBeVisible();
    await productCard.click();
    await page.waitForLoadState('networkidle');
    console.log('Product page loaded');
    
    // Verify product details page
    await expect(page.locator('h1.product-name, .product-detail h1')).toContainText(/air fryer/i, { timeout: 5000 });
    const productPrice = page.locator('.price, .product-price').first();
    await expect(productPrice).toBeVisible();
    console.log('✓ Product details page verified');
    
    // Add to cart
    console.log('Adding product to cart...');
    const addToCartButton = page.locator('div.cart-and-ipay button, button:has-text("Add To Cart")').first();
    await expect(addToCartButton).toBeEnabled();
    await addToCartButton.click();
    await page.waitForTimeout(2000);
    console.log('Product added to cart');
    
    // Verify cart count updated
    const cartCount = page.locator('.minicart-quantity, .cart-count').first();
    await expect(cartCount).toContainText('1', { timeout: 5000 });
    console.log('✓ Cart count verified');
    
    // Open mini cart and proceed to checkout
    console.log('Opening cart...');
    await page.locator('div.navbar-header div.d-none svg, a.minicart-link').first().click();
    await page.waitForTimeout(1000);
    
    // Verify cart contains product
    const cartProduct = page.locator('.minicart .product-name, .cart-item').first();
    await expect(cartProduct).toBeVisible();
    console.log('✓ Product visible in cart');
    
    console.log('Proceeding to checkout...');
    const checkoutButton = page.locator('div.ca-pr-0 a, a:has-text("Checkout")').first();
    await expect(checkoutButton).toBeVisible();
    await checkoutButton.click();
    await page.waitForLoadState('networkidle');
    console.log('Checkout page loaded');
    
    // Verify checkout page loaded
    await expect(page).toHaveURL(/checkout/i);
    console.log('✓ Checkout page URL verified');
    
    // Guest checkout - Enter email
    console.log('Entering guest email...');
    const emailInput = page.locator('#email-guest');
    await expect(emailInput).toBeVisible();
    await emailInput.fill('vladjimir_henry@conair.com');
    await page.locator('fieldset > button, button:has-text("Continue as guest")').first().click();
    await page.waitForTimeout(2000);
    console.log('Continuing as guest');
    
    // Verify shipping form is visible
    await expect(page.locator('#shippingFirstNamedefault')).toBeVisible({ timeout: 5000 });
    console.log('✓ Shipping form loaded');
    
    // Fill shipping information
    console.log('Filling shipping information...');
    await page.locator('#shippingFirstNamedefault').fill('Vlad');
    await page.locator('#shippingLastNamedefault').fill('Henry');
    await page.locator('#shippingAddressOnedefault').fill('1 cummings');
    await page.locator('#shippingPhoneNumberdefault').fill('5555555555');
    console.log('Shipping information filled');
    
    // Continue to payment
    console.log('Continuing to payment...');
    const continueButton = page.locator('#form-submit, button:has-text("Continue")').first();
    await expect(continueButton).toBeEnabled();
    await continueButton.click();
    await page.waitForTimeout(3000);
    console.log('Payment page loaded');
    
    // Verify payment form is visible
    await expect(page.locator('#cardOwner')).toBeVisible({ timeout: 5000 });
    console.log('✓ Payment form loaded');
    
    // Fill payment information
    console.log('Filling payment information...');
    await page.locator('#cardOwner').fill('Vlad Henry');
    await page.locator('#cardNumber').fill('4242 4242 4242 4242');
    await page.locator('#expirationMonth').fill('7');
    await page.locator('#expirationYear').fill('2030');
    await page.locator('#securityCode').fill('444');
    console.log('Payment information filled');
    
    // Verify order summary is present
    const orderSummary = page.locator('.order-summary, .cart-summary').first();
    await expect(orderSummary).toBeVisible();
    console.log('✓ Order summary visible');
    
    // Submit payment
    console.log('Submitting payment...');
    const submitPaymentButton = page.locator('button.submit-payment, button:has-text("Continue")').first();
    await expect(submitPaymentButton).toBeEnabled();
    await submitPaymentButton.click();
    await page.waitForTimeout(3000);
    
    // Place order
    const placeOrderButton = page.locator('div.col-md-7 > div.row > div > div > div > button').first();
    await expect(placeOrderButton).toBeVisible();
    await placeOrderButton.click();
    await page.waitForLoadState('networkidle');
    console.log('Place order button clicked and order submitted');
    
    // Verify order confirmation page
    await expect(page).toHaveURL(/confirmation|order-confirmation|thank-you/i, { timeout: 10000 });
    console.log('✓ Order confirmation URL verified');
    
    // Verify confirmation message
    const confirmationMessage = page.locator('.order-confirmation, .order-thank-you, h1:has-text("Thank")').first();
    await expect(confirmationMessage).toBeVisible({ timeout: 10000 });
    console.log('✓ Confirmation message displayed');
    
    // Verify order number exists
    const orderNumber = page.locator('.order-number, [class*="order-number"]').first();
    await expect(orderNumber).toBeVisible({ timeout: 5000 });
    const orderNumberText = await orderNumber.textContent();
    expect(orderNumberText).toMatch(/\d+/); // Contains digits
    console.log(`✓ Order number confirmed: ${orderNumberText}`);
    
    console.log('✅ Guest checkout completed successfully');
  });
});
