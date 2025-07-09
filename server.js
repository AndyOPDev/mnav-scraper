import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/mnav', async (req, res) => {
  try {
    const { data } = await axios.get('https://www.strategy.com', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(data);
    const mnavText = $('p.tracker_numberGridLargeValue__7wTDK').text().trim();
    const mnav = parseFloat(mnavText) || 0;

    res.json({
      status: 'success',
      mnav: mnav,
      updated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener datos',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor activo en http://localhost:${PORT}`);
});
