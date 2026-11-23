import { Router } from 'express';
import axios from 'axios';

import { authMiddleware } from '../middleware/authMiddleware';
import { requireString } from '../utils/validation';

const router = Router();

router.use(authMiddleware);

const EAN_PICTURES_BASES = [
  'https://www.eanpictures.com.br:9000/api/desc',
  'http://www.eanpictures.com.br:9000/api/desc',
];

// GET /api/products/barcode/:barcode
// Consulta os dados de um produto a partir do código de barras (EAN).
router.get('/barcode/:barcode', async (req, res) => {
  const barcode = requireString(req.params.barcode, 'barcode', { min: 6, max: 20 });

  for (const base of EAN_PICTURES_BASES) {
    try {
      const response = await axios.get(`${base}/${encodeURIComponent(barcode)}`, {
        timeout: 8000,
        headers: { Accept: 'application/json' },
      });

      if (response.status === 200) {
        return res.json(response.data);
      }
    } catch (error) {
      // Tenta o próximo endereço (https -> http).
      console.error(`Falha ao consultar eanpictures (${base}):`, (error as Error).message);
    }
  }

  return res
    .status(502)
    .json({ error: 'Não foi possível consultar os dados do produto.' });
});

export default router;
