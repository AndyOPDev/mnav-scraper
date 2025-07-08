const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/mnav', async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--single-process',
        '--disable-dev-shm-usage'
      ],
      headless: 'new',
      timeout: 60000
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    
    await page.goto('https://www.strategy.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });

    const mnav = await page.$eval('p.tracker_numberGridLargeValue__7wTDK', el => 
      parseFloat(el.textContent.trim())
    );

    res.json({ status: 'success', mnav });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => console.log(`✅ Servidor activo en puerto ${PORT}`));
