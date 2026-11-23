'use client';

import { useApi } from '@/hooks/useApi';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatedCard } from '@/components/AnimatedCard';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { ShareListModal } from '@/components/ShareListModal';
import { useToast } from '@/hooks/use-toast';

interface ListItem {
  id: string;
  product_name: string;
  barcode: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  checked: boolean;
}

interface ShoppingList {
  id: string;
  title: string;
  total_value: number;
  permission?: 'owner' | 'view' | 'edit' | string;
  items: ListItem[];
}

interface FormFields {
  productName: string;
  barcode?: string;
  quantity: string | number;
  unitPrice: string | number;
}

const formSchema = z.object({
  productName: z.string().min(1, 'Informe o nome do produto'),
  barcode: z.string().optional(),
  quantity: z
    .union([z.string(), z.number()])
    .transform(val => parseFloat(val as string) || 0)
    .refine(val => val > 0, 'A quantidade deve ser maior que zero'),
  unitPrice: z
    .union([z.string(), z.number()])
    .transform(val => parseFloat(val as string) || 0)
    .refine(val => val >= 0, 'O preço não pode ser negativo'),
});

const formatBRL = (value: number) =>
  (Number.isFinite(value) ? value : 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

const apiUrl = (path: string) => `/api/forward?url=${encodeURIComponent(path)}`;
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export default function ListPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? '');

  const { data: list, loading, error, refetch } = useApi<ShoppingList>(`/api/lists/${id}`);
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<ListItem | null>(null);
  const [editValues, setEditValues] = useState({
    productName: '',
    barcode: '',
    quantity: '1',
    unitPrice: '0',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const [renameOpen, setRenameOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);

  const form = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: '',
      barcode: '',
      quantity: 1,
      unitPrice: 0,
    },
  });

  const canEdit = !list?.permission || list.permission !== 'view';
  const isOwner = !list?.permission || list.permission === 'owner';

  async function onSubmit(values: FormFields) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(apiUrl(`/api/lists/${id}/items`), {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({
          productName: values.productName,
          barcode: values.barcode,
          quantity: values.quantity,
          unitPrice: values.unitPrice,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Falha ao adicionar item.');
      }

      form.reset();
      refetch();
      toast({
        title: 'Item adicionado',
        description: `${values.productName} foi adicionado à lista.`,
      });
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Falha ao adicionar item.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleScan(result: string) {
    form.setValue('barcode', result);

    try {
      const response = await fetch(`/api/eanpictures?barcode=${encodeURIComponent(result)}`);
      const data = await response.json();

      if (response.ok && data.Status === '200' && data.Nome) {
        form.setValue('productName', data.Nome);
        toast({
          title: 'Código de barras lido',
          description: `Produto: ${data.Nome}`,
        });
      } else {
        form.setValue('productName', `Produto ${result}`);
        toast({
          title: 'Código de barras lido',
          description: `Produto não encontrado para o código ${result}.`,
        });
      }
    } catch (err) {
      console.error('Erro ao buscar dados do produto:', err);
      form.setValue('productName', `Produto ${result}`);
      toast({
        title: 'Código de barras lido',
        description: `Não foi possível buscar os dados do código ${result}.`,
      });
    }
  }

  async function toggleChecked(item: ListItem) {
    setBusyItemId(item.id);

    try {
      const response = await fetch(apiUrl(`/api/lists/${id}/items/${item.id}`), {
        method: 'PUT',
        headers: JSON_HEADERS,
        body: JSON.stringify({ checked: !item.checked }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Falha ao atualizar o item.');
      }

      refetch();
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Falha ao atualizar o item.',
      });
    } finally {
      setBusyItemId(null);
    }
  }

  function openEdit(item: ListItem) {
    setEditingItem(item);
    setEditValues({
      productName: item.product_name,
      barcode: item.barcode ?? '',
      quantity: String(item.quantity),
      unitPrice: String(item.unit_price),
    });
  }

  async function saveEdit(event: React.FormEvent) {
    event.preventDefault();
    if (!editingItem) return;

    const quantity = Number(editValues.quantity);
    const unitPrice = Number(editValues.unitPrice);

    if (!editValues.productName.trim()) {
      toast({ title: 'Dados inválidos', description: 'Informe o nome do produto.' });
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast({ title: 'Dados inválidos', description: 'A quantidade deve ser maior que zero.' });
      return;
    }
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      toast({ title: 'Dados inválidos', description: 'O preço não pode ser negativo.' });
      return;
    }

    setSavingEdit(true);

    try {
      const response = await fetch(
        apiUrl(`/api/lists/${id}/items/${editingItem.id}`),
        {
          method: 'PUT',
          headers: JSON_HEADERS,
          body: JSON.stringify({
            productName: editValues.productName.trim(),
            barcode: editValues.barcode.trim(),
            quantity,
            unitPrice,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Falha ao salvar o item.');
      }

      setEditingItem(null);
      refetch();
      toast({ title: 'Item atualizado', description: 'As alterações foram salvas.' });
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Falha ao salvar o item.',
      });
    } finally {
      setSavingEdit(false);
    }
  }

  async function removeItem(item: ListItem) {
    if (!window.confirm(`Remover "${item.product_name}" da lista?`)) return;

    setBusyItemId(item.id);

    try {
      const response = await fetch(apiUrl(`/api/lists/${id}/items/${item.id}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Falha ao remover o item.');
      }

      refetch();
      toast({ title: 'Item removido', description: item.product_name });
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Falha ao remover o item.',
      });
    } finally {
      setBusyItemId(null);
    }
  }

  function openRename() {
    setNewTitle(list?.title ?? '');
    setRenameOpen(true);
  }

  async function saveTitle(event: React.FormEvent) {
    event.preventDefault();
    const title = newTitle.trim();

    if (!title) {
      toast({ title: 'Dados inválidos', description: 'Informe um nome para a lista.' });
      return;
    }

    setSavingTitle(true);

    try {
      const response = await fetch(apiUrl(`/api/lists/${id}`), {
        method: 'PUT',
        headers: JSON_HEADERS,
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Falha ao renomear a lista.');
      }

      setRenameOpen(false);
      refetch();
      toast({ title: 'Lista renomeada', description: title });
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Falha ao renomear a lista.',
      });
    } finally {
      setSavingTitle(false);
    }
  }

  async function deleteList() {
    if (!list) return;

    if (!window.confirm(`Excluir a lista "${list.title}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/lists/${id}`), { method: 'DELETE' });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Falha ao excluir a lista.');
      }

      toast({ title: 'Lista excluída', description: list.title });
      router.push('/dashboard');
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Falha ao excluir a lista.',
      });
    }
  }

  if (loading) {
    return <div className="container mx-auto py-10 px-4">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <p className="mb-4 text-destructive">{error.message}</p>
        <Button onClick={refetch}>Tentar novamente</Button>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="container mx-auto py-10 px-4">
        <p>Lista não encontrada.</p>
        <Link href="/dashboard" className="text-primary hover:underline">
          Voltar ao dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/15">
      <div className="container mx-auto py-10 px-4">
        <AnimatedCard className="mb-6 glass">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="flex flex-wrap items-center gap-3 text-2xl">
                {list.title}
                {list.permission && list.permission !== 'owner' && (
                  <span className="rounded-full border border-border/60 px-2 py-0.5 text-xs font-normal text-muted-foreground">
                    {list.permission === 'edit' ? 'Compartilhada (edição)' : 'Compartilhada (leitura)'}
                  </span>
                )}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Total da lista: <strong>{formatBRL(list.total_value)}</strong>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isOwner && <ShareListModal listId={list.id} />}
              {canEdit && (
                <Button variant="outline" onClick={openRename}>
                  Renomear
                </Button>
              )}
              {isOwner && (
                <Button variant="outline" onClick={deleteList}>
                  Excluir
                </Button>
              )}
            </div>
          </CardHeader>
        </AnimatedCard>

        {canEdit && (
          <AnimatedCard className="mb-6 glass">
            <CardHeader>
              <CardTitle>Adicionar item</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <BarcodeScanner onScan={handleScan} />
              </div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="grid grid-cols-1 md:grid-cols-5 gap-4"
                >
                  <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Produto</FormLabel>
                        <FormControl>
                          <Input placeholder="Leite" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código de barras</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unitPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço unitário</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="self-end" disabled={isSubmitting}>
                    {isSubmitting ? 'Adicionando...' : 'Adicionar'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </AnimatedCard>
        )}

        <AnimatedCard className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Itens ({list.items.length})
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Total: <strong>{formatBRL(list.total_value)}</strong>
            </div>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            {list.items.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                Nenhum item nesta lista ainda.
              </p>
            ) : (
              <div className="max-h-[calc(100vh-420px)] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10" />
                      <TableHead>Descrição</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Qtd.</TableHead>
                      <TableHead>Preço unit.</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.items.map(item => (
                      <TableRow key={item.id} className={item.checked ? 'opacity-60' : ''}>
                        <TableCell>
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-primary"
                            checked={item.checked}
                            disabled={!canEdit || busyItemId === item.id}
                            onChange={() => toggleChecked(item)}
                            aria-label={`Marcar ${item.product_name} como comprado`}
                          />
                        </TableCell>
                        <TableCell className={item.checked ? 'line-through' : ''}>
                          {item.product_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.barcode || '—'}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatBRL(item.unit_price)}</TableCell>
                        <TableCell>{formatBRL(item.total_price)}</TableCell>
                        <TableCell className="text-right">
                          {canEdit && (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEdit(item)}
                                disabled={busyItemId === item.id}
                              >
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeItem(item)}
                                disabled={busyItemId === item.id}
                              >
                                Remover
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </AnimatedCard>
      </div>

      <Dialog open={Boolean(editingItem)} onOpenChange={open => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar item</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveEdit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="edit-product-name">
                Produto
              </label>
              <Input
                id="edit-product-name"
                value={editValues.productName}
                onChange={event =>
                  setEditValues(prev => ({ ...prev, productName: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="edit-barcode">
                Código de barras
              </label>
              <Input
                id="edit-barcode"
                value={editValues.barcode}
                onChange={event =>
                  setEditValues(prev => ({ ...prev, barcode: event.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="edit-quantity">
                  Quantidade
                </label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min={1}
                  value={editValues.quantity}
                  onChange={event =>
                    setEditValues(prev => ({ ...prev, quantity: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="edit-unit-price">
                  Preço unitário
                </label>
                <Input
                  id="edit-unit-price"
                  type="number"
                  step="0.01"
                  min={0}
                  value={editValues.unitPrice}
                  onChange={event =>
                    setEditValues(prev => ({ ...prev, unitPrice: event.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear lista</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveTitle} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="list-title">
                Nome da lista
              </label>
              <Input
                id="list-title"
                value={newTitle}
                onChange={event => setNewTitle(event.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRenameOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={savingTitle}>
                {savingTitle ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
