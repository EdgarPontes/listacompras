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
  title: z.string().min(1),
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

export default function NewListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isScanningFiscalCoupon, setIsScanningFiscalCoupon] = useState(false);
  const [importedItems, setImportedItems] = useState<ListItem[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await fetch('/api/forward?url=/api/lists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...values, items: importedItems }),
    });

    if (response.ok) {
      router.push('/dashboard');
    } else {
      // Handle error
      console.error('Failed to create list');
    }
  }

  const handleScan = async (result: string) => {
    if (isScanningFiscalCoupon) {
      // Assume result is a URL for fiscal coupon; send it to backend parser
      try {
        const response = await fetch(`/api/forward?url=/api/nfce/parse-nfce`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: result }),
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Backend parse failed (${response.status}): ${text}`);
        }

        const data: ParseNfceResponse = await response.json();
        const produtos = Array.isArray(data?.produtos) ? data.produtos : [];
        const items: ListItem[] = produtos.map(p => ({
          productName: p.descricao || 'Produto',
          barcode: p.codigo || '',
          quantity: typeof p.quantidade === 'number' && !isNaN(p.quantidade) ? p.quantidade : 1,
          unitPrice: typeof p.valor_unitario === 'number' && !isNaN(p.valor_unitario)
            ? p.valor_unitario
            : (typeof p.valor_total === 'number' && !isNaN(p.valor_total) ? p.valor_total : 0),
        }));

        if (items.length > 0) {
          setImportedItems(prevItems => [...prevItems, ...items]);
          toast({
            title: 'Fiscal coupon scanned successfully',
            description: `Added ${items.length} items from fiscal coupon.`,
          });
          setIsScanningFiscalCoupon(false);
        } else {
          toast({
            title: 'Fiscal coupon scanned',
            description: 'No items found in the fiscal coupon.',
          });
        }
      } catch (error) {
        console.error("Error processing fiscal coupon:", error);
        toast({
          title: "Fiscal coupon scanned",
          description: `Error processing fiscal coupon: ${(error as Error).message}`,
        });
      }
    } else {
      // This part should not be reached if scanFiscalCoupon is true
      // If it is, it means a regular barcode was scanned in a context not expecting it.
      toast({
        title: "Unexpected Barcode Scan",
        description: "Please use the 'Import from Fiscal Coupon' button for QR codes.",
      });
    }
  };

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
                >
                  Criar Lista
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <Button
            onClick={() => setIsScanningFiscalCoupon(!isScanningFiscalCoupon)}
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
              <h2 className="text-2xl font-bold mb-4 text-foreground">Itens Importados</h2>
              <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-foreground">Produto</TableHead>
                      <TableHead className="text-foreground">Código</TableHead>
                      <TableHead className="text-foreground">Quantidade</TableHead>
                      <TableHead className="text-foreground">Preço Unitário</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importedItems.map((item, index) => (
                      <TableRow key={index} className="border-border">
                        <TableCell className="text-foreground">{item.productName}</TableCell>
                        <TableCell className="text-muted-foreground">{item.barcode}</TableCell>
                        <TableCell className="text-foreground">{item.quantity}</TableCell>
                        <TableCell className="text-primary font-semibold">R$ {item.unitPrice.toFixed(2)}</TableCell>
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
