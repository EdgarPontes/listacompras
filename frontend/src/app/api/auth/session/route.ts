import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const COOKIE_MAX_AGE = 60 * 60; // 1 hora (mesmo tempo de expiração do JWT)

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({ token: undefined }));

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  return response;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  return NextResponse.json({ token: token.value });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });

  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
