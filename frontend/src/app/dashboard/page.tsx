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
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Shopping Lists</h1>
        <Button asChild>
          <Link href="/lists/new">Create New List</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists?.map((list) => (
          <Link href={`/lists/${list.id}`} key={list.id}>
            <AnimatedCard className="glass">
              <CardHeader>
                <CardTitle>{list.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${list.total_value.toFixed(2)}</p>
              </CardContent>
            </AnimatedCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
