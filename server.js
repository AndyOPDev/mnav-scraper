const express = require('express');
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/mnav', async (req, res) => {
  let browser;
  try {
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || await chromium.executablePath;
    
    browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      executablePath,
      headless: true,
      ignoreHTTPSErrors: true
    });

    const page = await browser.newPage();
    await page.goto('https://www.strategy.com/', {
      waitUntil: 'networkidle2',
      timeout: 45000
    });

    const mnav = await page.$eval('p.tracker_numberGridLargeValue__7wTDK', el => 
      parseFloat(el.textContent.trim())
    );

    res.json({ status: 'success', mnav });

  } catch (error) {
    console.error('Scraper error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Error fetching data',
      error: error.message
    });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => console.log(`Service running on port ${PORT}`));
