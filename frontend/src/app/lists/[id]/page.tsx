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
  items: ListItem[];
}

interface FormFields {
  productName: string;
  barcode?: string;
  quantity: string | number;
  unitPrice: string | number;
}

const formSchema = z.object({
  productName: z.string().min(1),
  barcode: z.string().optional(),
  quantity: z.union([z.string(), z.number()]).transform((val) => parseFloat(val as string) || 0).refine((val) => val > 0),
  unitPrice: z.union([z.string(), z.number()]).transform((val) => parseFloat(val as string) || 0).refine((val) => val >= 0),
});


export default function ListPage() {
  const params = useParams();
  const { id } = params;
  const { data: list, loading, error, setData } = useApi<ShoppingList>(
    `/api/lists/${id}`
  );
  const { toast } = useToast();

  const form = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: '',
      barcode: '',
      quantity: 1,
      unitPrice: 0,
    },
  });

  async function onSubmit(values: FormFields) {
    const response = await fetch(`/api/forward?url=/api/lists/${id}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productName: values.productName,
        barcode: values.barcode,
        quantity: values.quantity,
        unitPrice: values.unitPrice,
      }),
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

  const handleScan = async (result: string) => {
    form.setValue('barcode', result);

    try {
      const response = await fetch(`/api/eanpictures?barcode=${result}`);
      const data = await response.json();

      if (response.ok && data.Status === "200") {
        form.setValue('productName', data.Nome);
        toast({
          title: "Barcode scanned successfully",
          description: `Product: ${data.Nome}`,
        });
      } else {
        form.setValue('productName', `Product with barcode ${result}`);
        toast({
          title: "Barcode scanned",
          description: `Could not find product for barcode: ${result}`,
        });
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
      form.setValue('productName', `Product with barcode ${result}`);
      toast({
        title: "Barcode scanned",
        description: `Error fetching product data for barcode: ${result}`,
      });
    }
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

  const totalUnitValue = list.items ? list.items.reduce((sum, item) => sum + item.unit_price, 0) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/15">
      <div className="container mx-auto py-10 px-4">
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
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode</FormLabel>
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items</CardTitle>
            <div className="text-xs text-muted-foreground">
              Total Unit Value: ${totalUnitValue.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              Total Value: ${list.total_value.toFixed(2)}
            </div>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Código de Barras</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Preço Unitário</TableHead>
                    <TableHead>Preço Total</TableHead>
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
            </div>
          </CardContent>
        </AnimatedCard>
      </div>
    </div>
  );
}
