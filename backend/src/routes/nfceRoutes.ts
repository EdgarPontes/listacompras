import { Router } from 'express';
import { NfceParserService } from '../services/nfceParserService';

const router = Router();
const parser = new NfceParserService();

// POST /api/nfce/parse-nfce
// Body: { html?: string, url?: string }
router.post('/parse-nfce', async (req, res) => {
  try {
    const { html, url } = req.body || {};

    if (!html && !url) {
      return res.status(400).json({ error: 'Send either "html" or "url" in the request body.' });
    }

    const result = html
      ? await parser.parseFromHtml(html)
      : await parser.parseFromUrl(url);

    // Basic acceptance validations
    const numericOk = Array.isArray(result.produtos)
      && result.produtos.every(p => (
        (p.quantidade == null || typeof p.quantidade === 'number') &&
        (p.valor_unitario == null || typeof p.valor_unitario === 'number') &&
        (p.valor_total == null || typeof p.valor_total === 'number')
      ));

    if (!numericOk) {
      return res.status(422).json({ error: 'Numeric conversion failed for one or more products', result });
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
