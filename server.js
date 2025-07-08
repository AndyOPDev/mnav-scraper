const express = require('express');
const puppeteer = require('puppeteer-core'); // Usamos puppeteer-core
const chromium = require('@sparticuz/chromium-min'); // Paquete optimizado para serverless

const app = express();
const PORT = process.env.PORT || 10000;

chromium.setGraphicsMode = false; // Desactiva GPU para entornos headless

app.get('/mnav', async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ],
      executablePath: await chromium.executablePath(), // Ruta automática
      headless: chromium.headless,
      ignoreHTTPSErrors: true
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Configuración robusta de timeout
    await page.goto('https://www.strategy.com/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Espera selectiva con fallback
    try {
      await page.waitForSelector('p.tracker_numberGridLargeValue__7wTDK', { timeout: 10000 });
    } catch {
      console.warn('Selector no encontrado, intentando fallback...');
    }

    const mnav = await page.$eval('p.tracker_numberGridLargeValue__7wTDK', el => 
      parseFloat(el.textContent.trim()) || 0
    );

    res.json({
      status: 'success',
      mnav: mnav,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error crítico:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error en el servidor',
      technicalDetails: error.message.replace(/\n/g, ' ') // Para mejor legibilidad en logs
    });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => console.log(`🚀 Servidor listo en puerto ${PORT}`));
