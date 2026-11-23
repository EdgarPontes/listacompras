'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { useToast } from '@/hooks/use-toast';

interface ListItem {
  productName: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
}

const formSchema = z.object({
  title: z.string().min(1, 'Informe um nome para a lista'),
});

// Backend response shape for NFC-e parsing
type ParseNfceResponse = {
  produtos: Array<{
    descricao: string;
    codigo: string | null;
    quantidade: number | null;
    valor_unitario: number | null;
    valor_total: number | null;
  }>;
};

const formatBRL = (value: number) =>
  (Number.isFinite(value) ? value : 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

export default function NewListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isScanningFiscalCoupon, setIsScanningFiscalCoupon] = useState(false);
  const [importedItems, setImportedItems] = useState<ListItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/forward?url=/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...values, items: importedItems }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Falha ao criar a lista.');
      }

      const created = await response.json().catch(() => null);
      toast({ title: 'Lista criada', description: values.title });

      if (created?.id) {
        router.push(`/lists/${created.id}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Falha ao criar a lista.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleScan = async (result: string) => {
    if (!isScanningFiscalCoupon) {
      toast({
        title: 'Código inesperado',
        description: 'Use "Importar da Nota Fiscal" para ler QR codes de cupom.',
      });
      return;
    }

    try {
      const response = await fetch('/api/forward?url=/api/nfce/parse-nfce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: result }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Falha ao interpretar o cupom (${response.status}).`);
      }

      const data: ParseNfceResponse = await response.json();
      const produtos = Array.isArray(data?.produtos) ? data.produtos : [];

      const items: ListItem[] = produtos.map(produto => {
        const rawQuantity =
          typeof produto.quantidade === 'number' && produto.quantidade > 0
            ? produto.quantidade
            : 1;
        // O banco armazena quantidade inteira; arredondamos e preservamos o total.
        const quantity = Math.max(1, Math.round(rawQuantity));

        const totalFromReceipt =
          typeof produto.valor_total === 'number' && Number.isFinite(produto.valor_total)
            ? produto.valor_total
            : null;
        const unitFromReceipt =
          typeof produto.valor_unitario === 'number' && Number.isFinite(produto.valor_unitario)
            ? produto.valor_unitario
            : null;

        const unitPrice =
          quantity !== rawQuantity && totalFromReceipt !== null
            ? Number((totalFromReceipt / quantity).toFixed(2))
            : unitFromReceipt ?? totalFromReceipt ?? 0;

        return {
          productName: produto.descricao || 'Produto',
          barcode: produto.codigo || '',
          quantity,
          unitPrice: Number(unitPrice.toFixed(2)),
        };
      });

      if (items.length > 0) {
        setImportedItems(prev => [...prev, ...items]);
        toast({
          title: 'Cupom importado',
          description: `${items.length} itens adicionados a partir do cupom fiscal.`,
        });
        setIsScanningFiscalCoupon(false);
      } else {
        toast({
          title: 'Cupom lido',
          description: 'Nenhum item encontrado no cupom fiscal.',
        });
      }
    } catch (err) {
      console.error('Erro ao processar cupom fiscal:', err);
      toast({
        title: 'Erro ao importar cupom',
        description: err instanceof Error ? err.message : 'Erro ao processar o cupom fiscal.',
      });
    }
  };

  const removeImportedItem = (index: number) => {
    setImportedItems(prev => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const importedTotal = importedItems.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/15">
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-2xl">
          <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-8 shadow-lg">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-foreground">Nome da Lista</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Compras do mês, Lista do supermercado..."
                          className="bg-background/50 border-border focus:border-primary text-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Criando...' : 'Criar Lista'}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <Button
            onClick={() => setIsScanningFiscalCoupon(current => !current)}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            {isScanningFiscalCoupon ? 'Fechar Scanner' : 'Importar da Nota Fiscal'}
          </Button>

          {isScanningFiscalCoupon && (
            <div className="mt-4">
              <BarcodeScanner
                onScan={handleScan}
                scanFiscalCoupon={isScanningFiscalCoupon}
                onClose={() => setIsScanningFiscalCoupon(false)}
              />
            </div>
          )}

          {importedItems.length > 0 && (
            <div className="mt-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl font-bold text-foreground">Itens Importados</h2>
                <p className="text-sm text-muted-foreground">
                  Total: <strong>{formatBRL(importedTotal)}</strong>
                </p>
              </div>
              <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-foreground">Produto</TableHead>
                      <TableHead className="text-foreground">Código</TableHead>
                      <TableHead className="text-foreground">Quantidade</TableHead>
                      <TableHead className="text-foreground">Preço Unitário</TableHead>
                      <TableHead className="text-foreground">Total</TableHead>
                      <TableHead className="text-right text-foreground">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importedItems.map((item, index) => (
                      <TableRow key={`${item.barcode}-${index}`} className="border-border">
                        <TableCell className="text-foreground">{item.productName}</TableCell>
                        <TableCell className="text-muted-foreground">{item.barcode || '—'}</TableCell>
                        <TableCell className="text-foreground">{item.quantity}</TableCell>
                        <TableCell className="text-primary font-semibold">
                          {formatBRL(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {formatBRL(item.quantity * item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeImportedItem(index)}
                          >
                            Remover
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
