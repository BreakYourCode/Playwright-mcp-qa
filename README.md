# Playwright MCP QA Automation

A complete Playwright QA automation environment with Model Context Protocol (MCP) integration, optimized for GitHub Codespaces and GitHub Copilot.

## 🚀 Quick Start

### GitHub Codespaces

1. Click the "Code" button and select "Create codespace on main"
2. The devcontainer will automatically:
   - Set up Node.js 20
   - Install dependencies
   - Install Playwright browsers
3. Start testing: `npm test`

### Local Development

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run tests
npm test

# Run tests in UI mode
npx playwright test --ui

# Run tests in headed mode
npx playwright test --headed

# Run specific test file
npx playwright test tests/example.spec.ts

# Generate test report
npx playwright show-report
```

## 📁 Project Structure

```
.
├── .devcontainer/
│   └── devcontainer.json       # Dev container configuration
├── .github/
│   └── workflows/
│       └── playwright.yml      # CI/CD pipeline
├── tests/
│   ├── example.spec.ts         # Homepage tests
│   └── login.spec.ts           # Login flow tests
├── playwright.config.ts        # Playwright configuration
├── mcp.config.json            # MCP integration config
└── package.json               # Project dependencies
```

## ⚙️ Configuration

### MCP Integration

Configure your MCP server settings in `mcp.config.json`:

```json
{
  "mcpServers": {
    "playwright-mcp": {
      "serverUrl": "https://your-mcp-server-url.com",
      "authToken": "your-auth-token-here",
      "enabled": true
    }
  }
}
```

### Playwright Settings

Key configuration in `playwright.config.ts`:
- **Test Directory**: `./tests`
- **Reporters**: HTML and list
- **Retries**: 1 retry on failure
- **Screenshots**: Captured on failure
- **Videos**: Recorded on failure
- **Mode**: Headless
- **Browsers**: Chromium, Firefox, WebKit

## 🤖 GitHub Copilot Integration

This project is optimized for GitHub Copilot assistance:

### Writing Tests
- Open a test file and describe your test scenario in comments
- Copilot will suggest complete test implementations
- Example: `// test that user can login with valid credentials`

### Generating Selectors
- Type `await page.` and let Copilot suggest appropriate selectors
- Copilot understands Playwright's locator strategies

### Debugging
- Ask Copilot Chat: "Why is this test failing?"
- Request: "Add better error handling to this test"
- Get suggestions: "How can I make this test more reliable?"

### Best Practices
```typescript
// Copilot understands Playwright patterns:
// 1. Use meaningful test descriptions
test('user can complete checkout process', async ({ page }) => {
  // 2. Add clear comments for complex logic
  // Navigate to checkout and verify cart items
  
  // 3. Use proper assertions
  await expect(page.locator('.cart-item')).toHaveCount(3);
});
```

## 🧪 Test Examples

### Example Test (tests/example.spec.ts)
Tests basic homepage functionality and navigation.

### Login Flow Test (tests/login.spec.ts)
Demonstrates a complete user interaction flow with todo management.

## 📊 Reports

After running tests:
```bash
# View HTML report
npx playwright show-report

# Report location: playwright-report/index.html
```

Reports include:
- Test results summary
- Screenshots of failures
- Videos of failed test runs
- Trace files for debugging

## 🔧 CI/CD

GitHub Actions workflow automatically:
- Runs on every push
- Tests on Ubuntu latest
- Installs dependencies and browsers
- Executes all tests
- Uploads test reports and artifacts

View results in the "Actions" tab of your repository.

## 📝 Writing New Tests

1. Create a new file in `tests/` directory:
   ```bash
   touch tests/my-feature.spec.ts
   ```

2. Import Playwright test utilities:
   ```typescript
   import { test, expect } from '@playwright/test';
   ```

3. Write your tests:
   ```typescript
   test('my test description', async ({ page }) => {
     await page.goto('https://example.com');
     await expect(page).toHaveTitle(/Expected Title/);
   });
   ```

4. Run your new tests:
   ```bash
   npx playwright test tests/my-feature.spec.ts
   ```

## 🐛 Debugging

### Debug Mode
```bash
# Run with Playwright Inspector
npx playwright test --debug

# Debug specific test
npx playwright test tests/example.spec.ts --debug
```

### Trace Viewer
```bash
# Generate trace on failure (default)
npx playwright test

# View trace
npx playwright show-trace trace.zip
```

### VS Code Debugging
1. Install the Playwright Test extension
2. Set breakpoints in your test files
3. Click "Run Test" or "Debug Test" in the gutter

## 🔍 Troubleshooting

### Bot Detection and CAPTCHA Issues

**Conair Stage Site (`stage.conair.com`)**
- **Issue**: PerimeterX bot detection blocks automated browsers
- **Error**: "Access to this page has been denied" with redirect to `/PX-Show`
- **Solutions**:
  - Contact QA team to whitelist testing IP addresses
  - Request a test environment without PerimeterX
  - Implement stealth mode plugins (playwright-extra)
  - Use API-based testing instead of UI automation

**Cuisinart Stage Site (`stage.cuisinart.com`)**
- **Status**: ✅ Site accessible, login flow navigable
- **Issue**: reCAPTCHA v2/v3 protection on login form
- **Login Flow Working**:
  - ✅ Homepage loads successfully
  - ✅ Account link found and clickable
  - ✅ Login modal opens
  - ✅ Form fields fillable
  - ✅ Sign in button clickable
- **Blocking Factors**:
  - reCAPTCHA verification required
  - May need valid staging credentials
  - Potential IP-based rate limiting
- **Solutions**:
  - Request QA credentials for `vladjimir_henry@conair.com`
  - Disable reCAPTCHA on staging environment
  - Implement reCAPTCHA token bypass (requires API key)
  - Use a dedicated QA environment without CAPTCHA

### Test Credentials

Current test credentials in use:
```
HTTP Basic Auth: storefront / conair1
User Login: vladjimir_henry@conair.com / conair1
```

**Note**: Verify these credentials with the QA team before running tests.

### Running Tests in Codespaces

Codespaces is a headless environment. Always run tests in headless mode:
```bash
# Correct - headless mode (default)
npm test

# Will fail - requires display server
npx playwright test --headed
npx playwright codegen
```

For debugging, use trace viewer instead:
```bash
npx playwright test --trace on
npx playwright show-trace test-results/.../trace.zip
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [GitHub Copilot Documentation](https://docs.github.com/copilot)
- [MCP Documentation](https://modelcontextprotocol.io)

## 🤝 Contributing

1. Create a new branch for your feature
2. Write tests for new functionality
3. Ensure all tests pass: `npm test`
4. Submit a pull request

## 📄 License

ISC

---

**Happy Testing with Playwright, MCP, and GitHub Copilot! 🎭**
