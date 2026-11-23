'use client';

import { useApi } from '@/hooks/useApi';
import { AnimatedCard } from '@/components/AnimatedCard';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ShoppingList {
  id: string;
  title: string;
  total_value: number;
  permission?: 'owner' | 'view' | 'edit' | string;
}

const formatBRL = (value: number) =>
  (Number.isFinite(value) ? value : 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

export default function DashboardPage() {
  const { data: lists, loading, error, refetch } = useApi<ShoppingList[]>('/api/lists');

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map(index => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-lg border border-border/50 bg-card/40"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="mx-auto max-w-md rounded-lg border border-border/50 bg-card/40 p-8 text-center">
          <h3 className="mb-2 text-xl font-semibold text-foreground">
            Não foi possível carregar suas listas
          </h3>
          <p className="mb-6 text-muted-foreground">{error.message}</p>
          <Button onClick={refetch}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/15">
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Minhas listas</h2>
            <p className="text-muted-foreground">Gerencie suas listas de compras</p>
          </div>
          <Button asChild>
            <Link href="/lists/new">Nova Lista</Link>
          </Button>
        </div>

        {lists && lists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map(list => (
              <Link href={`/lists/${list.id}`} key={list.id}>
                <AnimatedCard className="glass hover:shadow-xl transition-all duration-300 hover:scale-105 bg-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl text-card-foreground flex items-center justify-between gap-2">
                      <span className="truncate">{list.title}</span>
                      <svg
                        className="w-5 h-5 text-muted-foreground shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </CardTitle>
                    {list.permission && list.permission !== 'owner' && (
                      <span className="inline-flex w-fit items-center rounded-full border border-border/60 px-2 py-0.5 text-xs text-muted-foreground">
                        Compartilhada com você ({list.permission === 'edit' ? 'edição' : 'leitura'})
                      </span>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <p className="text-3xl font-bold text-primary">
                        {formatBRL(list.total_value)}
                      </p>
                      <div className="text-sm text-muted-foreground">Total estimado</div>
                    </div>
                  </CardContent>
                </AnimatedCard>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-lg p-12 max-w-md mx-auto">
              <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-xl font-semibold text-foreground mb-2">Nenhuma lista encontrada</h3>
              <p className="text-muted-foreground mb-6">Crie sua primeira lista de compras para começar</p>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/lists/new">Criar Primeira Lista</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
