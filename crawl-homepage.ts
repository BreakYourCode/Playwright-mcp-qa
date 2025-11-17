import { chromium } from '@playwright/test';
import * as fs from 'fs';

async function crawlHomepage() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('🔍 Crawling Cuisinart homepage...\n');

  // Navigate to homepage
  await page.goto('https://storefront:conair1@stage.cuisinart.com');
  await page.waitForLoadState('domcontentloaded');

  // Handle OneTrust banner
  try {
    await page.locator('#onetrust-accept-btn-handler').click({ timeout: 5000 });
    await page.waitForTimeout(1000);
  } catch (e) {
    console.log('No OneTrust banner found');
  }

  // Handle Attentive modal
  try {
    const attentiveFrame = page.frameLocator('iframe[src*="attn.tv"]').first();
    const closeButton = attentiveFrame.locator('button[aria-label="close"], button:has-text("close"), .close-button').first();
    await closeButton.click({ timeout: 10000 });
    await page.waitForTimeout(2000);
  } catch (e) {
    console.log('No Attentive modal found');
  }

  const report: any = {
    url: page.url(),
    title: await page.title(),
    timestamp: new Date().toISOString(),
    elements: {}
  };

  console.log('📄 Page Title:', report.title);
  console.log('🔗 URL:', report.url);
  console.log('\n' + '='.repeat(80) + '\n');

  // Extract Header Elements
  console.log('🏠 HEADER ELEMENTS');
  console.log('-'.repeat(80));
  
  const logo = await page.locator('a.logo, .header-logo, [class*="logo"]').first().getAttribute('class').catch(() => 'not found');
  console.log('Logo class:', logo);
  report.elements.logo = logo;

  const headerNav = await page.locator('nav, .navigation, .main-menu').first().getAttribute('class').catch(() => 'not found');
  console.log('Main navigation class:', headerNav);
  report.elements.mainNav = headerNav;

  // Get all navigation links
  const navLinks = await page.locator('nav a, .navigation a, .main-menu a').allTextContents();
  console.log('Navigation items:', navLinks.slice(0, 10).join(', '));
  report.elements.navLinks = navLinks;

  // Search element
  const searchInput = await page.locator('input[type="search"], input[placeholder*="Search"], .search-input').first().getAttribute('class').catch(() => 'not found');
  console.log('Search input class:', searchInput);
  report.elements.searchInput = searchInput;

  // Cart icon
  const cartIcon = await page.locator('.minicart, .cart-icon, [class*="cart"]').first().getAttribute('class').catch(() => 'not found');
  console.log('Cart icon class:', cartIcon);
  report.elements.cartIcon = cartIcon;

  console.log('\n' + '='.repeat(80) + '\n');

  // Extract Hero/Banner Elements
  console.log('🎨 HERO/BANNER ELEMENTS');
  console.log('-'.repeat(80));
  
  const heroSection = await page.locator('.hero, .banner, .featured, [class*="carousel"], [class*="slider"]').first().getAttribute('class').catch(() => 'not found');
  console.log('Hero section class:', heroSection);
  report.elements.heroSection = heroSection;

  const heroImages = await page.locator('.hero img, .banner img, .carousel img').count();
  console.log('Number of hero images:', heroImages);
  report.elements.heroImagesCount = heroImages;

  console.log('\n' + '='.repeat(80) + '\n');

  // Extract Main Content Elements
  console.log('📦 MAIN CONTENT ELEMENTS');
  console.log('-'.repeat(80));

  const mainContent = await page.locator('main, .main-content, #main').first().getAttribute('class').catch(() => 'not found');
  console.log('Main content class:', mainContent);
  report.elements.mainContent = mainContent;

  // Get product tiles if any on homepage
  const productTiles = await page.locator('.product, .product-tile, [class*="product-item"]').count();
  console.log('Product tiles on homepage:', productTiles);
  report.elements.productTilesCount = productTiles;

  // Get category sections
  const categories = await page.locator('.category, [class*="category"]').count();
  console.log('Category sections:', categories);
  report.elements.categorySections = categories;

  console.log('\n' + '='.repeat(80) + '\n');

  // Extract Footer Elements
  console.log('👣 FOOTER ELEMENTS');
  console.log('-'.repeat(80));

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  const footer = await page.locator('footer, .footer').first().getAttribute('class').catch(() => 'not found');
  console.log('Footer class:', footer);
  report.elements.footer = footer;

  const footerLinks = await page.locator('footer a, .footer a').allTextContents();
  console.log('Footer links (first 15):', footerLinks.slice(0, 15).join(', '));
  report.elements.footerLinks = footerLinks;

  console.log('\n' + '='.repeat(80) + '\n');

  // Get all selectors used
  console.log('🎯 KEY SELECTORS TO USE IN TESTS');
  console.log('-'.repeat(80));
  
  const selectors = {
    logo: await page.locator('a.logo, .header-logo, [class*="logo"]').first().evaluate(el => {
      const selector = el.className ? `.${el.className.split(' ')[0]}` : el.tagName.toLowerCase();
      return selector;
    }).catch(() => 'a.logo'),
    
    mainNav: await page.locator('nav').first().evaluate(el => {
      return el.className ? `.${el.className.split(' ')[0]}` : 'nav';
    }).catch(() => 'nav'),
    
    searchInput: await page.locator('input[type="search"]').first().evaluate(el => {
      return el.className ? `.${el.className.split(' ')[0]}` : 'input[type="search"]';
    }).catch(() => 'input[type="search"]'),
    
    cart: await page.locator('[class*="cart"]').first().evaluate(el => {
      return el.className ? `.${el.className.split(' ')[0]}` : '[class*="cart"]';
    }).catch(() => '[class*="cart"]'),
    
    hero: await page.locator('[class*="hero"], [class*="banner"], [class*="carousel"]').first().evaluate(el => {
      return el.className ? `.${el.className.split(' ')[0]}` : '[class*="hero"]';
    }).catch(() => '[class*="hero"]'),
    
    footer: await page.locator('footer').first().evaluate(el => {
      return el.className ? `.${el.className.split(' ')[0]}` : 'footer';
    }).catch(() => 'footer')
  };

  console.log(JSON.stringify(selectors, null, 2));
  report.selectors = selectors;

  console.log('\n' + '='.repeat(80) + '\n');

  // Take screenshot
  await page.screenshot({ path: 'homepage-screenshot.png', fullPage: true });
  console.log('📸 Full page screenshot saved to: homepage-screenshot.png');

  // Save HTML
  const html = await page.content();
  fs.writeFileSync('homepage-full.html', html);
  console.log('💾 HTML saved to: homepage-full.html');

  // Save report
  fs.writeFileSync('homepage-crawl-report.json', JSON.stringify(report, null, 2));
  console.log('📋 Crawl report saved to: homepage-crawl-report.json');

  console.log('\n✅ Crawl complete!');

  await browser.close();
}

crawlHomepage().catch(console.error);
