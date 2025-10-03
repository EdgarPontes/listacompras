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
}

export default function DashboardPage() {
  const { data: lists, loading, error } = useApi<ShoppingList[]>('/api/lists');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/15">
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <div>
            <p className="text-muted-foreground">Gerencie suas listas de compras</p>
          </div>
        </div>

        {lists && lists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <Link href={`/lists/${list.id}`} key={list.id}>
                <AnimatedCard className="glass hover:shadow-xl transition-all duration-300 hover:scale-105 bg-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl text-card-foreground flex items-center justify-between">
                      {list.title}
                      <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <p className="text-3xl font-bold text-primary">
                        R$ {list.total_value.toFixed(2)}
                      </p>
                      <div className="text-sm text-muted-foreground">
                        Total estimado
                      </div>
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
