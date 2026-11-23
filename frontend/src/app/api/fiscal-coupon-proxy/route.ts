import { NextRequest, NextResponse } from 'next/server';

/**
 * Bloqueia destinos internos/privados para evitar SSRF.
 */
function isSafePublicUrl(raw: string): boolean {
  let url: URL;

  try {
    url = new URL(raw);
  } catch {
    return false;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;

  const host = url.hostname.toLowerCase();

  if (
    host === 'localhost' ||
    host === '::1' ||
    host === '0.0.0.0' ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  ) {
    return false;
  }

  return true;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  if (!isSafePublicUrl(url)) {
    return NextResponse.json({ error: 'URL não permitida.' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; ListaComprasBot/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    const html = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Falha ao buscar o cupom fiscal.' },
        { status: response.status }
      );
    }

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error('Erro ao buscar cupom fiscal:', error);
    return NextResponse.json({ error: 'Falha ao buscar o cupom fiscal.' }, { status: 502 });
  }
}
