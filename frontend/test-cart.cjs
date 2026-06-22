const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.status() >= 400 && response.url().includes('/api/')) {
      console.log('Error Response:', response.url(), response.status());
      response.text().then(text => console.log('Response Body:', text)).catch(() => {});
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('Console Error:', msg.text());
  });

  console.log("Navigating to login...");
  await page.goto('http://localhost:5175/login');
  
  // Login as collector
  await page.fill('input[type="email"]', 'collector@example.com');
  await page.fill('input[type="password"]', 'collectorpass');
  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(2000);
  
  console.log("Navigating to artifact 103...");
  await page.goto('http://localhost:5175/artifacts/103');
  
  await page.waitForTimeout(2000);
  
  console.log("Clicking Add to Cart...");
  await page.click('button:has-text("Add to cart")');
  
  await page.waitForTimeout(2000);
  
  console.log("Clicking Save...");
  await page.click('button.ad-btn--secondary:has-text("Save")');
  
  await page.waitForTimeout(2000);

  console.log("Clicking Message Seller...");
  await page.click('button:has-text("Message seller")');
  
  await page.waitForTimeout(2000);
  
  await browser.close();
})();
