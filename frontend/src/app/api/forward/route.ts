import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BACKEND_URL } from '@/lib/backend';

/**
 * O proxy só aceita caminhos internos da API (começando com /api/),
 * evitando SSRF para hosts arbitrários.
 */
function resolveBackendUrl(raw: string | null): string {
  if (!raw || !raw.startsWith('/api/') || raw.startsWith('//') || raw.includes('://')) {
    throw new Error('URL inválida. Use um caminho interno começando com /api/.');
  }
  return `${BACKEND_URL}${raw}`;
}

async function parseBody(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function forward(req: NextRequest, method: string) {
  let target: string;

  try {
    target = resolveBackendUrl(req.nextUrl.searchParams.get('url'));
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const init: RequestInit = { method, headers, cache: 'no-store' };

  if (!['GET', 'HEAD', 'DELETE'].includes(method)) {
    try {
      const body = await req.json();
      init.body = JSON.stringify(body);
    } catch {
      // Requisições sem corpo são válidas para alguns PUT/PATCH.
    }
  }

  try {
    const response = await fetch(target, init);

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const text = await response.text();
    const data = await parseBody(text);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Falha ao encaminhar requisição para o backend:', error);
    return NextResponse.json(
      { error: 'Não foi possível conectar ao backend.' },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest) {
  return forward(req, 'GET');
}

export async function POST(req: NextRequest) {
  return forward(req, 'POST');
}

export async function PUT(req: NextRequest) {
  return forward(req, 'PUT');
}

export async function PATCH(req: NextRequest) {
  return forward(req, 'PATCH');
}

export async function DELETE(req: NextRequest) {
  return forward(req, 'DELETE');
}
