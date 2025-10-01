import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const barcode = req.nextUrl.searchParams.get('barcode');

  if (!barcode) {
    return NextResponse.json({ error: 'Barcode is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`http://www.eanpictures.com.br:9000/api/desc/${barcode}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying request to eanpictures.com.br:", error);
    return NextResponse.json({ error: 'Failed to fetch product data' }, { status: 500 });
  }
}
