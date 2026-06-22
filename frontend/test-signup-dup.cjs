const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('Console:', msg.type(), msg.text()));
  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      const text = await response.text().catch(() => '<no body>');
      console.log('<<', response.status(), response.url(), text);
    }
  });

  await page.goto('http://localhost:5174/signup');

  // Fill signup form
  await page.fill('input[name="first_name"]', 'Test3');
  await page.fill('input[name="last_name"]', 'Collector3');
  await page.fill('input[name="email"]', 'testcollector3@example.com');
  await page.fill('input[name="password"]', 'testpass123');
  
  const createBtn = page.locator('button:has-text("Create account")');
  await createBtn.click();
  
  await page.waitForTimeout(2000);
  
  const text = await page.evaluate(() => document.body.innerText);
  if (text.includes("Signup was not accepted")) {
      console.log("FOUND ERROR MESSAGE IN UI!");
  }
  
  await browser.close();
})();
