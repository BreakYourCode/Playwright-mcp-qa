# Narration Synchronization Guide

## Problem
Video recordings show actions happening immediately, but narration audio plays linearly after test completion, causing desync between video and audio.

## Architecture Analysis

### Current Setup (Post-Processing)
1. **Test Execution**: Video records in real-time, console.log messages captured
2. **Post-Processing**: After test completes, Azure TTS generates audio from logs
3. **Merging**: FFmpeg combines audio + video linearly (audio plays start-to-finish)

**Result**: Actions happen faster than narration can describe them.

## Solution: Calculated Delays (Option 1)

### Why This Approach?
- ✅ Works with existing post-processing pipeline
- ✅ Simple to implement and maintain
- ✅ Predictable, repeatable results
- ✅ No pipeline refactoring needed

### Implementation

Created `utils/narrated-log.ts` helper function:

```typescript
await narratedLog(page, 'Your message here');
```

**Features:**
- Calculates speech duration automatically (150 words/minute baseline)
- Adds punctuation pauses (300ms per period, 200ms per comma)
- 1.2x buffer for Azure TTS variations
- Minimum 1.5 second delay
- Rounded to nearest 100ms

### Usage Examples

#### Basic Usage
```typescript
import { narratedLog } from '../../utils/narrated-log';

// Before
console.log('Clicking button...');
await button.click();

// After
await narratedLog(page, 'Clicking button...');
await button.click();
```

#### Critical Narration Points
Apply `narratedLog` at these key moments:

1. **Before major navigation**
```typescript
await narratedLog(page, 'Navigating to checkout page');
await page.goto('/checkout');
```

2. **Before user interactions**
```typescript
await narratedLog(page, 'Clicking Appliances menu to open submenu');
await appliancesMenu.click();
```

3. **After waiting/delays**
```typescript
await narratedLog(page, 'Ready to start air fryer checkout flow');
// Next action happens after narration completes
```

4. **Status updates**
```typescript
await narratedLog(page, 'Attentive modal overlay successfully closed and removed');
```

#### Quick Reference
```typescript
// Short message (~5 words) = ~2-2.5 seconds
await narratedLog(page, 'Opening cart now');

// Medium message (~10 words) = ~3-4 seconds  
await narratedLog(page, 'Clicking on Air Fryer Toaster Oven with Grill product');

// Long message (~20 words) = ~6-8 seconds
await narratedLog(page, 'Filling shipping information with customer details including name, address, and phone number for delivery');
```

### Alternative Helpers

For fixed delays when message length is predictable:

```typescript
import { quickLog, longLog } from '../../utils/narrated-log';

// Fixed 2-second delay
await quickLog(page, 'Status: Passed');

// Fixed 4-second delay
await longLog(page, 'This is a longer message that needs more time');
```

## Alternatives Considered

### ❌ Option 2: Real-Time Async Queue
**Why rejected**: Narration is post-processed, not generated during test execution. Can't sync with audio that doesn't exist yet.

### ❌ Option 3: FFmpeg Timestamp Injection
**Why rejected**: 
- Requires parsing console timestamps and matching to video frames
- Complex frame-perfect audio insertion
- Fragile, difficult to maintain
- Would need complete pipeline refactoring

## Best Practices

1. **Apply selectively**: Only use `narratedLog` for important narration points
2. **Don't overuse**: Too many delays slow down tests unnecessarily
3. **Focus on transitions**: Navigation, form submissions, modal interactions
4. **Keep messages concise**: Shorter messages = faster tests
5. **Test and adjust**: If narration still cuts off, increase buffer in helper function

## Configuration

Edit `utils/narrated-log.ts` to adjust timing:

```typescript
// Change speech rate (words per second)
const durationMs = (words / 2.5) * 1000; // Default: 2.5 words/sec

// Change buffer multiplier
durationMs *= 1.2; // Default: 1.2x (20% buffer)

// Change minimum delay
durationMs = Math.max(durationMs, 1500); // Default: 1.5 seconds
```

## Migration Example

### Before (No Sync)
```typescript
console.log('Clicking Appliances menu to open submenu...');
const appliancesMenu = page.locator('div.menu-group > ul > li:nth-of-type(1) > a');
await appliancesMenu.click();
await page.waitForTimeout(1000);

console.log('Clicking Air Fryers...');
await page.locator('#appliances_airfryers').first().click();
await page.waitForLoadState('networkidle');
console.log('Air Fryers page loaded');
```

### After (With Sync)
```typescript
await narratedLog(page, 'Clicking Appliances menu to open submenu');
const appliancesMenu = page.locator('div.menu-group > ul > li:nth-of-type(1) > a');
await appliancesMenu.click();
await page.waitForTimeout(1000);

await narratedLog(page, 'Clicking Air Fryers');
await page.locator('#appliances_airfryers').first().click();
await page.waitForLoadState('networkidle');
await narratedLog(page, 'Air Fryers page loaded');
```

## Recommendations

### For Guest Checkout Test
Apply `narratedLog` at these critical points:

1. ✅ "Ready to start air fryer checkout flow" (already done)
2. ✅ "Clicking Appliances menu to open submenu" (already done)
3. "Clicking Air Fryers"
4. "Selecting white color variant"
5. "Clicking on Air Fryer Toaster Oven with Grill product"
6. "Adding product to cart"
7. "Opening cart"
8. "Proceeding to checkout"
9. "Entering guest email"
10. "Filling shipping information"
11. "Continuing to payment"
12. "Filling payment information"
13. "Submitting payment"
14. "Placing order"

### Performance Impact
- Each `narratedLog` adds 1.5-5 seconds depending on message length
- ~14 narrated logs × ~3 seconds average = ~42 seconds added to test
- Trade-off: Longer test runtime for perfect narration sync

### When NOT to Use
- Don't use for rapid assertions (✓ checkmarks)
- Don't use for silent background operations
- Don't use between tightly coupled actions

---

**Next Steps**: Apply `narratedLog` to remaining critical narration points in the guest checkout test.
