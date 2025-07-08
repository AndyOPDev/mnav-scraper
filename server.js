const express = require('express');
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/mnav', async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: [...chromium.args, '--disable-dev-shm-usage'],
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    await page.goto('https://www.strategy.com/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const mnav = await page.$eval('p.tracker_numberGridLargeValue__7wTDK', el => {
      return parseFloat(el.textContent.trim());
    });

    res.json({
      status: 'success',
      mnav: mnav
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
