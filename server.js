const express = require('express');
const chromium = require('chrome-aws-lambda'); // ★ Alternativa actualizada
const puppeteer = require('puppeteer-core');

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/mnav', async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(), // Auto-detects Chromium
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto('https://www.strategy.com/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    const mnav = await page.$eval(
      'p.tracker_numberGridLargeValue__7wTDK', 
      el => parseFloat(el.textContent.trim())
    );

    res.json({ status: 'success', mnav });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      status: 'error',
      error: error.message 
    });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
