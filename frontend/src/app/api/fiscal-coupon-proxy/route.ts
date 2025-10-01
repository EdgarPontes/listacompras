import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    const html = await response.text();

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch fiscal coupon data' }, { status: response.status });
    }

    return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html' } });
  } catch (error) {
    console.error("Error proxying fiscal coupon request:", error);
    return NextResponse.json({ error: 'Failed to fetch fiscal coupon data' }, { status: 500 });
  }
}
