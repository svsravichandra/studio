'use client';
import { useEffect, useState, useMemo, useTransition, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Order } from "@/lib/types";
import { getAllOrders } from '../actions';
import { Loader2 } from 'lucide-react';
import { OrderActions } from './order-actions';

type OrderWithUser = Order & { user: { id: string; name: string; email: string } };

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<OrderWithUser[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [, startTransition] = useTransition();

    const fetchOrders = useCallback(() => {
        startTransition(async () => {
            setIsLoading(true);
            try {
                const fetchedOrders = await getAllOrders();
                setOrders(fetchedOrders);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setIsLoading(false);
            }
        });
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const filteredOrders = useMemo(() => {
        if (statusFilter === 'all') {
            return orders;
        }
        return orders.filter(order => order.status.toLowerCase() === statusFilter.toLowerCase());
    }, [orders, statusFilter]);

    const getStatusVariant = (status: Order['status']) => {
        switch (status) {
            case 'shipped': return 'default';
            case 'delivered': return 'secondary';
            case 'processing': return 'outline';
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    };
    
    return (
        <Card className="bg-card border-border/50">
            <CardHeader>
                <CardTitle className="font-headline uppercase text-2xl">Manage Orders</CardTitle>
                <CardDescription>View and manage all customer orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-4">
                    <TabsList className="flex-wrap h-auto">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="processing">Processing</TabsTrigger>
                        <TabsTrigger value="shipped">Shipped</TabsTrigger>
                        <TabsTrigger value="delivered">Delivered</TabsTrigger>
                        <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                    </TabsList>
                </Tabs>

                {isLoading ? (
                     <div className="flex justify-center items-center h-60">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : filteredOrders.length === 0 ? (
                     <div className="text-center py-12 text-muted-foreground">
                        <p>No orders found for this status.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium truncate" style={{maxWidth: '100px'}}>{order.id}</TableCell>
                                    <TableCell>
                                        <div>{order.user.name}</div>
                                        <div className="text-xs text-muted-foreground">{order.user.email}</div>
                                    </TableCell>
                                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(order.status)} className="capitalize">{order.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                                    <TableCell className="text-center">
                                        <OrderActions order={order} onUpdate={fetchOrders} />
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
