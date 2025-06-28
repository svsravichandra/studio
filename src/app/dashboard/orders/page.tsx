'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { type Order } from "@/lib/types";
import { Truck, Repeat, RefreshCcw, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !db) {
        setIsLoading(false);
        return;
      }
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const fetchedOrders = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAtTimestamp = data.createdAt;
            return {
                id: doc.id,
                userId: data.userId,
                items: data.items,
                total: data.total,
                status: data.status,
                shippingAddress: data.shippingAddress,
                paymentIntentId: data.paymentIntentId,
                createdAt: (createdAtTimestamp && typeof createdAtTimestamp.toDate === 'function')
                  ? createdAtTimestamp.toDate().toISOString()
                  : new Date().toISOString(),
            } as Order;
        });

        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'shipped': return 'default';
      case 'delivered': return 'secondary';
      case 'processing': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  }

  if (isLoading) {
    return (
        <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="font-headline uppercase text-2xl">Order History</CardTitle>
              <CardDescription>View your past orders and their status.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
        </Card>
    );
  }

  return (
     <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="font-headline uppercase text-2xl">Order History</CardTitle>
          <CardDescription>View your past orders and their status.</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
                <p>You haven't placed any orders yet.</p>
            </div>
          ) : (
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
                {orders.map((order) => (
                    <TableRow key={order.id}>
                    <TableCell className="font-medium truncate" style={{maxWidth: '100px'}}>{order.id}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusVariant(order.status)} className="capitalize">{order.status}</Badge>
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
          )}
        </CardContent>
      </Card>
  );
}
