const express = require('express');
const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 10000;

// Instala Chromium manualmente si no existe
try {
  execSync('which chromium || apt-get install -y chromium', { stdio: 'inherit' });
} catch (e) {
  console.warn('No se pudo instalar Chromium automáticamente');
}

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
      executablePath: '/usr/bin/chromium-browser', // Ruta universal en Render
      headless: 'new'
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Configuración robusta
    await page.goto('https://www.strategy.com/', {
      waitUntil: 'networkidle2',
      timeout: 45000
    });

    // Extracción con redundancia
    const mnav = await page.evaluate(() => {
      return parseFloat(
        document.querySelector('p.tracker_numberGridLargeValue__7wTDK')?.textContent.trim() || 
        document.querySelector('[class*="value"]')?.textContent.trim() || 
        '0'
      );
    });

    res.json({ 
      status: 'success',
      mnav: mnav,
      renderedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error crítico:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error en el servidor',
      solution: 'Contacte al soporte técnico',
      error: error.message.replace(/\n/g, ' ')
    });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => console.log(`🟢 Servidor activo en puerto ${PORT}`));
