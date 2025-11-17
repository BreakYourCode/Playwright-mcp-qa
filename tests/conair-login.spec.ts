import { test, expect } from '@playwright/test';

test.describe('Conair Stage Login Tests', () => {
  test('should authenticate and login to Conair account', async ({ page }) => {
    // Navigate to stage.conair.com with HTTP Basic Auth credentials
    await page.goto('https://storefront:conair1@stage.conair.com');

    // Click on the "My Account" icon using role-based selector (most accessible)
    await page.getByRole('link', { name: /account|sign in|login/i }).click();

    // Fill in email using label text (Playwright auto-finds associated input)
    await page.getByLabel(/email|username/i).fill('vladjimir_henry@conair.com');

    // Fill in password using label text
    await page.getByLabel(/password/i).fill('conair1');

    // Click login button using role and text
    await page.getByRole('button', { name: /login|sign in|submit/i }).click();

    // Verify successful login by checking URL or logged-in state
    await expect(page).toHaveURL(/account|dashboard|profile/i);
  });
});
