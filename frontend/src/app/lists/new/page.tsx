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
  productName: z.string().optional(),
  barcode: z.string().optional(),
  quantity: z.coerce.number().optional(),
  unitPrice: z.coerce.number().optional(),
});

// Helper function to parse HTML
function parseFiscalCouponHtml(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const items: ListItem[] = [];

  // Find all product rows
  const productRows = doc.querySelectorAll('table.nfce_item_table tbody tr'); // Adjust selector based on actual HTML structure

  productRows.forEach(row => {
    const productNameElement = row.querySelector('.txtTit2');
    const quantityElement = row.querySelector('.Rqtd');
    const unitPriceElement = row.querySelector('.RvlUnit');
    const barcodeElement = row.querySelector('.RCod'); // Assuming a class for barcode

    const productName = productNameElement?.textContent?.trim() || 'Unknown Product';
    const quantity = parseFloat(quantityElement?.textContent?.replace(',', '.') || '1');
    const unitPrice = parseFloat(unitPriceElement?.textContent?.replace(',', '.') || '0');
    const barcode = barcodeElement?.textContent?.trim() || '';

    items.push({ productName, quantity, unitPrice, barcode });
  });

  return items;
}

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
      // Assume result is a URL for fiscal coupon
      try {
        const response = await fetch(`/api/fiscal-coupon-proxy?url=${encodeURIComponent(result)}`);
        const html = await response.text();

        if (response.ok) {
          const items = parseFiscalCouponHtml(html);
          if (items.length > 0) {
            setImportedItems(prevItems => [...prevItems, ...items]);
            toast({
              title: "Fiscal coupon scanned successfully",
              description: `Added ${items.length} items from fiscal coupon.`,
            });
            setIsScanningFiscalCoupon(false);
          } else {
            toast({
              title: "Fiscal coupon scanned",
              description: "No items found in the fiscal coupon.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Fiscal coupon scanned",
            description: `Failed to fetch fiscal coupon data: ${response.statusText}`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error processing fiscal coupon:", error);
        toast({
          title: "Fiscal coupon scanned",
          description: `Error processing fiscal coupon: ${(error as Error).message}`,
          variant: "destructive",
        });
      }
    } else {
      // This part should not be reached if scanFiscalCoupon is true
      // If it is, it means a regular barcode was scanned in a context not expecting it.
      toast({
        title: "Unexpected Barcode Scan",
        description: "Please use the 'Import from Fiscal Coupon' button for QR codes.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to Home</Button>
        <h1 className="text-3xl font-bold">Create New List</h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="My new list" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Create</Button>
        </form>
      </Form>

      <div className="mt-8">
        <Button onClick={() => setIsScanningFiscalCoupon(!isScanningFiscalCoupon)}>
          {isScanningFiscalCoupon ? 'Close Fiscal Coupon Scanner' : 'Import from Fiscal Coupon'}
        </Button>
        {isScanningFiscalCoupon && (
          <div className="mt-4">
            <BarcodeScanner onScan={handleScan} scanFiscalCoupon={isScanningFiscalCoupon} onClose={() => setIsScanningFiscalCoupon(false)} />
          </div>
        )}

        {importedItems.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Imported Items</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importedItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.barcode}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}