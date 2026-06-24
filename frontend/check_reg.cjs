const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('response', response => {
      if (!response.ok() && response.url().includes('localhost')) {
        console.log('HTTP ERROR:', response.url(), response.status());
      }
    });

    console.log('Navigating to register...');
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle0' });
    
    const testEmail = 'newuser' + Date.now() + '@example.com';
    console.log('Registering with:', testEmail);
    await page.type('#register-email', testEmail);
    await page.type('#register-password', 'password123');
    await page.type('#register-confirm-password', 'password123');
    
    console.log('Clicking register...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {}),
      page.click('#register-submit')
    ]);
    
    console.log('Current URL after register:', page.url());
    
    await browser.close();
  } catch (err) {
    console.error('Puppeteer Script Error:', err);
  }
})();
