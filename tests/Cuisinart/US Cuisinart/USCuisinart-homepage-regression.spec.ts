import { test, expect } from '@playwright/test';
import { narratedLog } from '../../../utils/narrated-log';

test.describe('US Cuisinart Homepage Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to stage.cuisinart.com with HTTP Basic Auth credentials
    await page.goto('https://storefront:conair1@stage.cuisinart.com');
    await page.waitForLoadState('domcontentloaded');

    // Handle OneTrust cookie banner if it appears
    try {
      const oneTrustBanner = page.locator('#onetrust-accept-btn-handler, button:has-text("Accept All Cookies")');
      await oneTrustBanner.waitFor({ timeout: 5000 });
      await oneTrustBanner.click();
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log('OneTrust banner not found or already dismissed');
    }

    // Handle Attentive iframe modal when it appears
    try {
      const attentiveFrame = page.frameLocator('iframe[src*="attn.tv"]').first();
      const closeButton = attentiveFrame.locator('button[aria-label="close"], button:has-text("close"), .close-button, [class*="close"]').first();
      await closeButton.waitFor({ state: 'visible', timeout: 20000 });
      await closeButton.click();
      await page.waitForTimeout(1000);
      
      // Wait for overlay to be removed
      const overlay = page.locator('div[id*="attentive"], div[class*="attentive"]').first();
      await overlay.waitFor({ state: 'detached', timeout: 10000 });
      console.log('Attentive modal overlay successfully closed and removed');
    } catch (error) {
      console.log('Attentive modal not found or already closed');
    }
  });

  test('should load homepage with correct title and logo', async ({ page }) => {
    await narratedLog(page, 'Verifying homepage elements');
    
    // Verify page title
    const title = await page.title();
    expect(title).toBe('Cuisinart - Kitchen appliances for the heart of your home');
    console.log('✓ Page title verified:', title);

    // Verify logo is visible
    const logo = page.locator('.banner_logo');
    await expect(logo).toBeVisible();
    console.log('✓ Logo is visible');

    await narratedLog(page, 'Homepage loaded successfully with logo and title');
  });

  test('should display main navigation menu', async ({ page }) => {
    await narratedLog(page, 'Checking main navigation menu');

    // Verify main navigation is present
    const nav = page.locator('nav, .navigation, .main-menu').first();
    await expect(nav).toBeVisible();
    console.log('✓ Main navigation is visible');

    // Verify key menu items exist
    const expectedMenuItems = ['Appliances', 'Cookware', 'Tools', 'Cutlery'];
    
    for (const item of expectedMenuItems) {
      const menuItem = page.locator(`nav a:has-text("${item}"), .navigation a:has-text("${item}")`).first();
      await expect(menuItem).toBeVisible();
      console.log(`✓ Menu item "${item}" is visible`);
    }

    await narratedLog(page, 'All main navigation items verified');
  });

  test('should display hero banner or featured content', async ({ page }) => {
    await narratedLog(page, 'Checking hero banner and featured content');

    // Check for hero banner section
    const heroSection = page.locator('.header-banner, .experience-commerce_layouts-herocarousel');
    await expect(heroSection).toBeVisible({ timeout: 10000 });
    console.log('✓ Hero banner is visible');

    await narratedLog(page, 'Featured content section verified');
  });

  test('should have functional search', async ({ page }) => {
    await narratedLog(page, 'Testing search functionality');

    // Locate search input
    const searchInput = page.locator('.search-field');
    await expect(searchInput).toBeVisible();
    console.log('✓ Search input is visible');

    // Type in search box
    await searchInput.fill('coffee maker');
    await page.waitForTimeout(1000);
    console.log('✓ Search text entered');

    // Submit search
    const searchButton = page.locator('button.fa-search, button[type="submit"]').first();
    await searchButton.click();
    await page.waitForLoadState('networkidle');

    // Verify search results page loaded
    expect(page.url()).toMatch(/search/i);
    console.log('✓ Search results page loaded');

    await narratedLog(page, 'Search functionality working correctly');
  });

  test('should display footer with important links', async ({ page }) => {
    await narratedLog(page, 'Verifying footer content');

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Verify footer is visible
    const footer = page.locator('footer, .footer').first();
    await expect(footer).toBeVisible();
    console.log('✓ Footer is visible');

    // Check for important footer links
    const importantLinks = ['About', 'Contact', 'Customer Service'];
    
    for (const linkText of importantLinks) {
      const link = page.locator(`footer a:has-text("${linkText}"), .footer a:has-text("${linkText}")`).first();
      const isVisible = await link.isVisible().catch(() => false);
      if (isVisible) {
        console.log(`✓ Footer link "${linkText}" found`);
      } else {
        console.log(`⚠ Footer link "${linkText}" not found (optional)`);
      }
    }

    await narratedLog(page, 'Footer content verified');
  });

  test('should have working shopping cart icon', async ({ page }) => {
    await narratedLog(page, 'Testing shopping cart functionality');

    // Locate cart icon
    const cartIcon = page.locator('.minicart');
    await expect(cartIcon).toBeVisible();
    console.log('✓ Shopping cart icon is visible');

    // Click cart icon
    await cartIcon.click();
    await page.waitForTimeout(2000);

    // Verify mini cart opened
    const miniCartContent = page.locator('.popover, .minicart-content, [class*="cart-dropdown"]');
    await expect(miniCartContent).toBeVisible({ timeout: 5000 });
    console.log('✓ Mini cart opened successfully');

    await narratedLog(page, 'Shopping cart functionality verified');
  });

  test('should allow navigation to product category', async ({ page }) => {
    await narratedLog(page, 'Testing category navigation');

    // Click on Appliances menu
    const appliancesMenu = page.locator('nav a:has-text("Appliances"), .navigation a:has-text("Appliances")').first();
    await appliancesMenu.hover();
    await page.waitForTimeout(1000);

    // Click on a subcategory (Coffee Makers)
    const subcategory = page.locator('a:has-text("Coffee Makers"), a[href*="coffee"]').first();
    await subcategory.click();
    await page.waitForLoadState('networkidle');

    // Verify category page loaded
    expect(page.url()).toMatch(/coffee|appliances/i);
    console.log('✓ Category page loaded');

    // Verify products are displayed
    const products = page.locator('.product, .product-tile, [class*="product-item"]');
    const productCount = await products.count();
    expect(productCount).toBeGreaterThan(0);
    console.log(`✓ ${productCount} products displayed`);

    await narratedLog(page, 'Category navigation successful');
  });

  test('should load page within acceptable time', async ({ page }) => {
    await narratedLog(page, 'Testing page load performance');

    const startTime = Date.now();
    
    // Reload page and measure load time
    await page.reload();
    await page.waitForLoadState('load');
    
    const loadTime = Date.now() - startTime;
    console.log(`✓ Page loaded in ${loadTime}ms`);

    // Assert load time is under 5 seconds
    expect(loadTime).toBeLessThan(5000);

    await narratedLog(page, `Page load time: ${loadTime} milliseconds`);
  });
});
