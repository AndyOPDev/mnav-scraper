const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/mnav', async (req, res) => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://www.strategy.com/');
    const mnav = await page.$eval('p.tracker_numberGridLargeValue__7wTDK', el => el.textContent.trim());
    await browser.close();
    res.json({ mnav: parseFloat(mnav) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));