const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 10000;

// Configuración esencial para Render
process.env.PUPPETEER_EXECUTABLE_PATH = '/usr/bin/google-chrome-stable';

app.get('/mnav', async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process'
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      headless: 'new' // Modo headless moderno
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Carga la página con timeout ajustado
    await page.goto('https://www.strategy.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });

    // Espera adicional para contenido dinámico
    await page.waitForSelector('p.tracker_numberGridLargeValue__7wTDK', { timeout: 10000 });

    // Extrae el valor
    const mnav = await page.$eval('p.tracker_numberGridLargeValue__7wTDK', el => {
      return parseFloat(el.textContent.trim());
    });

    res.json({
      status: 'success',
      mnav: mnav,
      updated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en Puppeteer:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener el mNAV',
      error: error.message
    });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => console.log(`✅ API activa en puerto ${PORT}`));
