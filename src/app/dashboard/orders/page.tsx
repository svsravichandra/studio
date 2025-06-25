'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { type Order } from "@/lib/types";
import { Truck, Repeat, RefreshCcw } from "lucide-react";

const mockOrders: Order[] = [
  {
    id: 'ORD-2024-789',
    date: '2024-07-15',
    status: 'Shipped',
    total: 34.00,
    items: [
      { id: 'whiskey-oak', name: 'Whiskey Oak', quantity: 2, price: 9.00, image: 'https://placehold.co/400x400.png', hint: 'whiskey soap' },
      { id: 'timber-smoke', name: 'Timber & Smoke', quantity: 1, price: 9.00, image: 'https://placehold.co/400x400.png', hint: 'charcoal soap' }
    ]
  },
  {
    id: 'ORD-2024-456',
    date: '2024-06-21',
    status: 'Delivered',
    total: 16.00,
    items: [
      { id: 'arctic-steel', name: 'Arctic Steel', quantity: 2, price: 8.00, image: 'https://placehold.co/400x400.png', hint: 'mint soap' }
    ]
  },
  {
    id: 'ORD-2024-123',
    date: '2024-05-02',
    status: 'Delivered',
    total: 25.00,
    items: [
        { id: 'scrubby-grit', name: 'Scrubby Grit', quantity: 1, price: 8.00, image: 'https://placehold.co/400x400.png', hint: 'coffee soap' },
        { id: 'spiced-tobacco', name: 'Spiced Tobacco', quantity: 1, price: 9.00, image: 'https://placehold.co/400x400.png', hint: 'tobacco soap' }
    ]
  }
];

export default function OrdersPage() {
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shipped': return 'default';
      case 'delivered': return 'secondary';
      case 'processing': return 'outline';
      default: return 'outline';
    }
  }

  return (
     <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="font-headline uppercase text-2xl">Order History</CardTitle>
          <CardDescription>View your past orders and their status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                  <TableCell className="flex justify-center items-center gap-2">
                    <Button variant="outline" size="sm" title="Track Order">
                      <Truck className="h-4 w-4" />
                    </Button>
                     <Button variant="outline" size="sm" title="Reorder">
                       <Repeat className="h-4 w-4" />
                    </Button>
                     <Button variant="outline" size="sm" title="Request Return">
                       <RefreshCcw className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
  );
}
