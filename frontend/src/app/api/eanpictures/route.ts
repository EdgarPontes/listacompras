import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const barcode = req.nextUrl.searchParams.get('barcode');

  if (!barcode) {
    return NextResponse.json({ error: 'Barcode is required' }, { status: 400 });
  }

  const bases = [
    'https://www.eanpictures.com.br:9000/api/desc',
    'http://www.eanpictures.com.br:9000/api/desc',
  ];

  for (const base of bases) {
    try {
      const response = await fetch(`${base}/${encodeURIComponent(barcode)}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (error) {
      console.error(`Falha ao consultar eanpictures (${base}):`, error);
    }
  }

  return NextResponse.json(
    { error: 'Não foi possível consultar os dados do produto.' },
    { status: 502 }
  );
}
