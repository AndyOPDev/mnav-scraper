const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 10000; // Render usa el puerto 10000 por defecto

app.get('/mnav', async (req, res) => {
  let browser;
  try {
    // Configuración CRUCIAL para Puppeteer en Render
const browser = await puppeteer.launch({
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--single-process' // ¡Nuevo parámetro clave!
  ],
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium'
});

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'); // Evitar bloqueos
    await page.goto('https://www.strategy.com/', { waitUntil: 'networkidle2', timeout: 30000 }); // Esperar a que cargue

    // Extrae el mNAV (ajusta el selector según el HTML real)
    const mnav = await page.$eval('p.tracker_numberGridLargeValue__7wTDK', el => {
      return el.textContent.trim(); // Ejemplo: "1.89" → 1.89
    });

    res.json({ 
      status: 'success',
      mnav: parseFloat(mnav) // Convertir a número
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      status: 'error',
      message: 'Error al obtener el mNAV',
      details: error.message 
    });
  } finally {
    if (browser) await browser.close(); // Cerrar el navegador siempre
  }
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
