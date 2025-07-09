import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';

const app = express();
const PORT = process.env.PORT || 10000;

// Cache simple en memoria
let mnavCache = {
  value: null,
  timestamp: 0
};

app.get('/mnav', async (req, res) => {
  try {
    // Usar cache si es reciente (<5 minutos)
    if (Date.now() - mnavCache.timestamp < 300000 && mnavCache.value) {
      return res.json({
        status: 'success',
        mnav: mnavCache.value,
        cached: true
      });
    }

    const { data } = await axios.get('https://www.strategy.com', {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(data);
    const mnavText = $('p.tracker_numberGridLargeValue__7wTDK').first().text().trim();
    const mnavValue = parseFloat(mnavText) || 0;

    // Actualizar cache
    mnavCache = {
      value: mnavValue,
      timestamp: Date.now()
    };

    res.json({
      status: 'success',
      mnav: mnavValue,
      updated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error:', error.message);
    // Devolver cache aunque esté viejo si hay error
    if (mnavCache.value) {
      return res.json({
        status: 'success',
        mnav: mnavCache.value,
        cached: true,
        warning: 'Datos no actualizados'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Error temporal. Intente más tarde.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor listo en puerto ${PORT}`);
});
