const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('Console:', msg.type(), msg.text()));
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log('>>', request.method(), request.url());
    }
  });
  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      console.log('<<', response.status(), response.url());
    }
  });

  console.log("Navigating to signup...");
  await page.goto('http://localhost:5174/signup');

  // Fill signup form
  await page.fill('input[name="first_name"]', 'Test3');
  await page.fill('input[name="last_name"]', 'Collector3');
  await page.fill('input[name="email"]', 'testcollector3@example.com');
  await page.fill('input[name="password"]', 'testpass123');
  
  const createBtn = page.locator('button:has-text("Create account")');
  console.log("Clicking signup button...");
  await createBtn.click();
  
  await page.waitForTimeout(2000);
  
  // Check text content on the page
  const text = await page.evaluate(() => document.body.innerText);
  if (text.includes("Signup was not accepted")) {
      console.log("FOUND ERROR MESSAGE IN UI!");
  } else if (text.includes("Your account is ready")) {
      console.log("FOUND SUCCESS MESSAGE IN UI!");
  } else {
      console.log("NO MESSAGE FOUND");
  }
  
  await browser.close();
})();
