import { chromium } from '@playwright/test';

async function crawlLoginPage() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('🔍 Crawling UK Cuisinart DEV login page...\n');

  await page.goto('https://storefront:conair1@dev.cuisinart.co.uk/login');
  await page.waitForLoadState('domcontentloaded');

  // Handle OneTrust
  try {
    await page.locator('#onetrust-accept-btn-handler').click({ timeout: 5000 });
    await page.waitForTimeout(1000);
  } catch (e) {
    console.log('No OneTrust banner');
  }

  // Handle Attentive
  try {
    const attentiveFrame = page.frameLocator('iframe[src*="attn.tv"]').first();
    const closeButton = attentiveFrame.locator('#closeIconSvg').first();
    await closeButton.click({ timeout: 10000 });
    await page.waitForTimeout(2000);
  } catch (e) {
    console.log('No Attentive modal');
  }

  console.log('📋 LOGIN FORM ELEMENTS');
  console.log('='.repeat(80));

  // Find email field
  const emailSelectors = [
    '#login-form-email',
    'input[name="loginEmail"]',
    'input[type="email"]',
    '#dwfrm_login_username',
    'input[name="dwfrm_login_username"]'
  ];

  let emailSelector = '';
  for (const selector of emailSelectors) {
    const exists = await page.locator(selector).count();
    if (exists > 0) {
      emailSelector = selector;
      console.log(`✓ Email field found: ${selector}`);
      break;
    }
  }

  // Find password field
  const passwordSelectors = [
    '#login-form-password',
    'input[name="loginPassword"]',
    'input[type="password"]',
    '#dwfrm_login_password',
    'input[name="dwfrm_login_password"]'
  ];

  let passwordSelector = '';
  for (const selector of passwordSelectors) {
    const exists = await page.locator(selector).count();
    if (exists > 0) {
      passwordSelector = selector;
      console.log(`✓ Password field found: ${selector}`);
      break;
    }
  }

  // Find submit button
  const submitSelectors = [
    'button[type="submit"]',
    'button.login-button',
    'button[name="dwfrm_login_login"]',
    '.login-form button',
    'input[type="submit"]'
  ];

  let submitSelector = '';
  for (const selector of submitSelectors) {
    const exists = await page.locator(selector).count();
    if (exists > 0) {
      submitSelector = selector;
      console.log(`✓ Submit button found: ${selector}`);
      break;
    }
  }

  // Find CSRF token
  const csrfSelectors = [
    'input[name="csrf_token"]',
    'input[name="dwfrm_login_securekey"]',
    'input[name="_csrf"]'
  ];

  let csrfSelector = '';
  for (const selector of csrfSelectors) {
    const exists = await page.locator(selector).count();
    if (exists > 0) {
      csrfSelector = selector;
      console.log(`✓ CSRF token found: ${selector}`);
      break;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📝 SELECTORS TO USE:');
  console.log('='.repeat(80));
  console.log(`Email: ${emailSelector || 'NOT FOUND'}`);
  console.log(`Password: ${passwordSelector || 'NOT FOUND'}`);
  console.log(`Submit: ${submitSelector || 'NOT FOUND'}`);
  console.log(`CSRF: ${csrfSelector || 'NOT FOUND'}`);

  // Get form HTML
  const formHTML = await page.locator('form').first().innerHTML().catch(() => 'Form not found');
  console.log('\n' + '='.repeat(80));
  console.log('🔍 FORM HTML:');
  console.log('='.repeat(80));
  console.log(formHTML.substring(0, 1000));

  await browser.close();
}

crawlLoginPage().catch(console.error);
