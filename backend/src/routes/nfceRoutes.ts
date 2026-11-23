import { Router } from 'express';
import { NfceParserService } from '../services/nfceParserService';
import { BadRequestError } from '../errors';
import { optionalString } from '../utils/validation';

const router = Router();
const parser = new NfceParserService();

const MAX_HTML_BYTES = 5_000_000;

function assertAllowedCouponUrl(raw: string): string {
  let parsed: URL;

  try {
    parsed = new URL(raw);
  } catch {
    throw new BadRequestError('URL do cupom inválida.');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new BadRequestError('A URL do cupom deve usar http ou https.');
  }

  const host = parsed.hostname.toLowerCase();
  const isPrivateHost =
    host === 'localhost' ||
    host === '::1' ||
    host === '0.0.0.0' ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host);

  if (isPrivateHost) {
    throw new BadRequestError('Host não permitido.');
  }

  return parsed.toString();
}

// POST /api/nfce/parse-nfce
// Body: { html?: string, url?: string }
router.post('/parse-nfce', async (req, res) => {
  const html = optionalString(req.body?.html, 'html');
  const url = optionalString(req.body?.url, 'url');

  if (!html && !url) {
    throw new BadRequestError('Envie "html" ou "url" no corpo da requisição.');
  }

  if (html && Buffer.byteLength(html, 'utf8') > MAX_HTML_BYTES) {
    throw new BadRequestError('HTML muito grande (limite de 5 MB).');
  }

  const result = html
    ? await parser.parseFromHtml(html)
    : await parser.parseFromUrl(assertAllowedCouponUrl(url!));

  // Validação básica de aceite dos campos numéricos.
  const numericOk =
    Array.isArray(result.produtos) &&
    result.produtos.every(
      produto =>
        (produto.quantidade == null || typeof produto.quantidade === 'number') &&
        (produto.valor_unitario == null || typeof produto.valor_unitario === 'number') &&
        (produto.valor_total == null || typeof produto.valor_total === 'number')
    );

  if (!numericOk) {
    return res.status(422).json({
      error: 'Falha na conversão numérica de um ou mais produtos.',
      result,
    });
  }

  return res.json(result);
});

export default router;
