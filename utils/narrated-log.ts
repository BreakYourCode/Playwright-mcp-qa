import { Page } from '@playwright/test';

/**
 * Helper function to log a message with automatic delay for narration sync.
 * 
 * Calculates speech duration based on:
 * - Average speech rate: 150 words per minute (2.5 words/second)
 * - Punctuation pauses: 300ms per period, 200ms per comma
 * - Minimum delay: 1.5 seconds (prevents cutting off very short messages)
 * - Buffer multiplier: 1.2x (accounts for Azure TTS variations)
 * 
 * @param page - Playwright page object
 * @param message - The message to log and calculate delay for
 * @returns Promise that resolves after the calculated delay
 */
export async function narratedLog(page: Page, message: string): Promise<void> {
  console.log(message);
  
  // Calculate narration duration
  const words = message.split(/\s+/).length;
  const periods = (message.match(/\./g) || []).length;
  const commas = (message.match(/,/g) || []).length;
  
  // Base duration: ~2.5 words per second
  let durationMs = (words / 2.5) * 1000;
  
  // Add pauses for punctuation
  durationMs += periods * 300;
  durationMs += commas * 200;
  
  // Apply 1.2x buffer for safety
  durationMs *= 1.2;
  
  // Minimum 1.5 seconds
  durationMs = Math.max(durationMs, 1500);
  
  // Round to nearest 100ms for cleaner delays
  durationMs = Math.round(durationMs / 100) * 100;
  
  await page.waitForTimeout(durationMs);
}

/**
 * Quick log for short status messages (uses fixed 2-second delay)
 */
export async function quickLog(page: Page, message: string): Promise<void> {
  console.log(message);
  await page.waitForTimeout(2000);
}

/**
 * Long log for detailed messages (uses fixed 4-second delay)
 */
export async function longLog(page: Page, message: string): Promise<void> {
  console.log(message);
  await page.waitForTimeout(4000);
}
