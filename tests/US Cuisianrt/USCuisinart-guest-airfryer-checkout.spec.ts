import { test, expect } from '@playwright/test';
import { narratedLog } from '../../utils/narrated-log';

test.describe('US Cuisinart Guest Air Fryer Checkout Tests', () => {
  test('should complete guest checkout with air fryer product', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes to account for narration delays
    
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

    // Handle Attentive iframe modal when it appears
    try {
      const attentiveFrame = page.frameLocator('iframe[src*="attn.tv"]').first();
      const closeButton = attentiveFrame.locator('#closeIconSvg').first();
      await closeButton.waitFor({ timeout: 20000 }); // Wait up to 20 seconds for modal
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
    await narratedLog(page, 'Ready to start air fryer checkout flow');
    
    // Navigate to Appliances > Air Fryers
    await narratedLog(page, 'Clicking Appliances menu to open submenu');
    const appliancesMenu = page.locator('div.menu-group > ul > li:nth-of-type(1) > a');
    await appliancesMenu.click({ position: { x: 94.546875, y: 14 } });
    
    // Click Air Fryers immediately while menu is open
    await page.locator('#appliances_airfryers').click({ position: { x: 54, y: 9 } });
    await page.waitForLoadState('domcontentloaded');
    await narratedLog(page, 'Air Fryers page loaded');
    
    // Verify Air Fryers page loaded correctly
    await expect(page).toHaveURL(/air-fryers/i);
    await expect(page.locator('h1, .page-title')).toContainText(/air fryer/i, { timeout: 5000 });
    console.log('✓ Air Fryers category page verified');
    
    // Select Air Fryer Toaster Oven with Grill - White color
    await narratedLog(page, 'Selecting white color variant');
    await page.locator('div.col-sm-12 li:nth-of-type(3) span').click();
    await page.waitForTimeout(1000);
    
    await narratedLog(page, 'Clicking on Air Fryer Toaster Oven with Grill product');
    const productCard = page.locator('div:nth-of-type(7) div.product-card__img img');
    await expect(productCard).toBeVisible();
    await productCard.click({ position: { x: 148.5, y: 132.03125 } });
    await page.waitForLoadState('domcontentloaded');
    await narratedLog(page, 'Product page loaded');
    
    // Verify product details page
    await expect(page.locator('h1.product-name, .product-detail h1')).toContainText(/air fryer/i, { timeout: 5000 });
    const productPrice = page.locator('.price, .product-price').first();
    await expect(productPrice).toBeVisible();
    console.log('✓ Product details page verified');
    
    // Add to cart
    await narratedLog(page, 'Adding product to cart');
    const addToCartButton = page.locator('div.cart-and-ipay button, button:has-text("Add To Cart")').first();
    await expect(addToCartButton).toBeEnabled();
    await addToCartButton.click();
    await page.waitForTimeout(2000);
    await narratedLog(page, 'Product added to cart');
    
    // Verify cart count updated
    const cartCount = page.locator('.minicart-quantity, .cart-count').first();
    await expect(cartCount).toContainText('1', { timeout: 5000 });
    console.log('✓ Cart count verified');
    
    // Open mini cart and proceed to checkout
    await narratedLog(page, 'Opening cart');
    await page.locator('div.navbar-header div.d-none svg, a.minicart-link').first().click();
    await page.waitForTimeout(1000);
    
    // Verify cart contains product
    const cartProduct = page.locator('.minicart .product-name, .cart-item').first();
    await expect(cartProduct).toBeVisible();
    console.log('✓ Product visible in cart');
    
    await narratedLog(page, 'Proceeding to checkout');
    const checkoutButton = page.locator('div.ca-pr-0 a, a:has-text("Checkout")').first();
    await expect(checkoutButton).toBeVisible();
    await checkoutButton.click();
    await page.waitForLoadState('networkidle');
    await narratedLog(page, 'Checkout page loaded');
    
    // Verify checkout page loaded
    await expect(page).toHaveURL(/checkout/i);
    console.log('✓ Checkout page URL verified');
    
    // Guest checkout - Enter email
    await narratedLog(page, 'Entering guest email');
    const emailInput = page.locator('#email-guest');
    await expect(emailInput).toBeVisible();
    await emailInput.fill('vladjimir_henry@conair.com');
    await page.locator('fieldset > button, button:has-text("Continue as guest")').first().click();
    await page.waitForTimeout(2000);
    await narratedLog(page, 'Continuing as guest');
    
    // Verify shipping form is visible
    await expect(page.locator('#shippingFirstNamedefault')).toBeVisible({ timeout: 5000 });
    console.log('✓ Shipping form loaded');
    
    // Fill shipping information
    await narratedLog(page, 'Filling shipping information');
    await page.locator('#shippingFirstNamedefault').fill('Vlad');
    await page.locator('#shippingLastNamedefault').fill('Henry');
    await page.locator('#shippingAddressOnedefault').fill('1 Cummings Point Rd');
    
    // Fill city, state, and zip code
    await page.locator('#shippingAddressCitydefault').fill('Stamford');
    await page.locator('#shippingStatedefault').selectOption('CT');
    await page.locator('#shippingZipCodedefault').fill('06902');
    
    await page.locator('#shippingPhoneNumberdefault').fill('5555555555');
    
    // Select Standard Service (free shipping) method - select the first radio option in the shipping method group
    await page.locator('label.shipping-method-option').first().click();
    await page.waitForTimeout(1000);
    await narratedLog(page, 'Shipping information filled');
    
    // Continue to payment
    await narratedLog(page, 'Continuing to payment');
    await page.locator('#form-submit').click();
    await page.waitForTimeout(5000); // Wait longer for payment page to load
    await narratedLog(page, 'Payment page loaded');
    
    // Verify payment form is visible
    await expect(page.locator('#cardOwner')).toBeVisible({ timeout: 10000 });
    console.log('✓ Payment form loaded');
    
    // Fill payment information
    await narratedLog(page, 'Filling payment information');
    await page.locator('#cardOwner').fill('Vlad Henry');
    await page.locator('#cardNumber').fill('4242 4242 4242 4242');
    await page.locator('#expirationMonth').selectOption('7');
    await page.locator('#expirationYear').selectOption('2030');
    await page.locator('#securityCode').fill('444');
    await narratedLog(page, 'Payment information filled');
    
    // Verify order summary heading is present
    await expect(page.locator('h2:has-text("Order Summary")')).toBeVisible();
    console.log('✓ Order summary visible');
    
    // Submit payment
    await narratedLog(page, 'Submitting payment');
    await page.locator('button.submit-payment').click();
    await page.waitForTimeout(3000);
    
    // Place order - wait for button to be enabled
    await narratedLog(page, 'Placing order');
    const placeOrderButton = page.locator('button:has-text("Place Order")').first();
    await expect(placeOrderButton).toBeVisible({ timeout: 5000 });
    
    // Wait for button to be enabled (not disabled)
    await placeOrderButton.waitFor({ state: 'attached', timeout: 5000 });
    await page.waitForTimeout(2000); // Additional wait for any async validation
    
    await placeOrderButton.click({ force: true });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await page.waitForTimeout(2000); // Extra wait for navigation
    await narratedLog(page, 'Order placed successfully');
    
    // Verify order confirmation page
    await expect(page).toHaveURL(/order-confirm|confirmation|order-confirmation|thank-you/i, { timeout: 15000 });
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
