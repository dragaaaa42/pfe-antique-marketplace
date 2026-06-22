const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Intercept and log all console and network requests
  page.on('console', msg => console.log('Console:', msg.type(), msg.text()));
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log('>>', request.method(), request.url());
    }
  });
  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      const text = await response.text().catch(() => '<no body>');
      console.log('<<', response.status(), response.url(), text);
    }
  });

  console.log("Navigating to signup...");
  await page.goto('http://localhost:5174/signup');

  // Fill signup form
  await page.fill('input[name="first_name"]', 'Test');
  await page.fill('input[name="last_name"]', 'Collector');
  await page.fill('input[name="email"]', 'testcollector2@example.com');
  await page.fill('input[name="password"]', 'testpass123');
  
  // Choose role 'buyer'
  // Assuming there's a radio or select for role. Let's look at the DOM or just try to click 'Create Account' directly.
  const createBtn = page.locator('button:has-text("Create account"), button:has-text("Sign up")');
  console.log("Clicking signup button...");
  await createBtn.click();
  
  // Wait for network idle or 3 seconds
  await page.waitForTimeout(3000);
  
  await browser.close();
})();
