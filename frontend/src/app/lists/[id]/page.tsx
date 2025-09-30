'use client';

import { useApi } from '@/hooks/useApi';
import { useParams } from 'next/navigation';
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
  items: ListItem[];
}

const formSchema = z.object({
  productName: z.string().min(1),
  barcode: z.string().optional(),
  quantity: z.coerce.number().min(1),
  unitPrice: z.coerce.number().min(0),
});

export default function ListPage() {
  const params = useParams();
  const { id } = params;
  const { data: list, loading, error, setData } = useApi<ShoppingList>(
    `/api/lists/${id}`
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: '',
      barcode: '',
      quantity: 1,
      unitPrice: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await fetch(`/api/forward?url=/api/lists/${id}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });

    if (response.ok) {
      const newItem = await response.json();
      setData((prevList) => {
        if (!prevList) return null;
        return {
          ...prevList,
          items: [...prevList.items, newItem],
        };
      });
      form.reset();
    } else {
      // Handle error
      console.error('Failed to create item');
    }
  }

  const handleScan = (result: string) => {
    form.setValue('barcode', result);
    // Here you could also fetch product information from an API based on the barcode
    form.setValue('productName', `Product with barcode ${result}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!list) {
    return <div>List not found</div>;
  }

  return (
    <div className="container mx-auto py-10">
            <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{list.title}</h1>
        <ShareListModal listId={id as string} />
      </div>
      <AnimatedCard className="mb-6 glass">
        <CardHeader>
          <CardTitle>Add New Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <BarcodeScanner onScan={handleScan} />
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Milk" {...field} />
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
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
                    <FormLabel>Unit Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="self-end">Add Item</Button>
            </form>
          </Form>
        </CardContent>
      </AnimatedCard>

      <AnimatedCard className="glass">
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>{item.barcode}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                  <TableCell>${item.total_price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      {/* Add edit/delete icons here */}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </AnimatedCard>
    </div>
  );
}
