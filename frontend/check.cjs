const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Log all console messages
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
    page.on('response', response => {
      if (!response.ok() && response.url().includes('localhost')) {
        console.log('HTTP ERROR:', response.url(), response.status());
      }
    });

    console.log('Navigating to login...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    
    console.log('Typing credentials...');
    await page.type('#login-email', 'test@example.com');
    await page.type('#login-password', 'password123');
    
    console.log('Clicking login...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => console.log('Navigation timeout/not needed')),
      page.click('#login-submit')
    ]);
    
    console.log('Current URL:', page.url());
    
    const pageContent = await page.content();
    if (pageContent.includes('bg-accent/20')) {
      const errorDiv = await page.evaluate(() => {
        const div = document.querySelector('.bg-accent\\/20');
        return div ? div.innerText : null;
      });
      console.log('LOGIN ERROR DIV:', errorDiv);
    }
    
    await browser.close();
  } catch (err) {
    console.error('Puppeteer Script Error:', err);
  }
})();
