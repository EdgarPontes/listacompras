import { cookies } from 'next/headers';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`,
  {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Handle error
    console.error('API request failed');
  }

  return response.json();
}
