'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/useApi';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();
  const { data: session, loading } = useApi('/api/auth/session');

  useEffect(() => {
    if (!loading && session) {
      router.push('/dashboard');
    }
  }, [session, loading, router]);

  if (loading || session) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-4xl font-bold mb-8">Bem-vindo à Lista de Compras</h1>
      <div className="flex space-x-4">
        <Button onClick={() => router.push('/login')}>Login</Button>
        <Button onClick={() => router.push('/register')}>Registrar</Button>
      </div>
    </div>
  );
}
