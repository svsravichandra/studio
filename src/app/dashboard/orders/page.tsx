
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { type Order } from "@/lib/types";
import { Truck, Repeat, RefreshCcw, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TrackingInfoModal } from './tracking-info-modal';
import { useCart } from "@/context/cart-context";
import { getProductsByIdsAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createReturnRequest, getReturnRequestIdsForUser } from "../actions";
import { mapOrder } from "@/lib/mappers";


export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [returnRequestIds, setReturnRequestIds] = useState<string[]>([]);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
      if (!user || !db) {
        setIsLoading(false);
        return;
      }
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const fetchedOrders = querySnapshot.docs.map(mapOrder);

        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders: ", error);
      } finally {
        setIsLoading(false);
      }
    }, [user]);

  const fetchReturnRequests = useCallback(async (userId: string) => {
    const ids = await getReturnRequestIdsForUser(userId);
    setReturnRequestIds(ids);
  }, []);

  useEffect(() => {
    if (user) {
        setIsLoading(true);
        fetchOrders();
        fetchReturnRequests(user.uid);
    }
  }, [user, fetchOrders, fetchReturnRequests]);

  const handleReorder = async (order: Order) => {
    setReorderingId(order.id);
    try {
        const productIds = order.items.map(item => item.productId);
        if (productIds.length === 0) return;

        const products = await getProductsByIdsAction(productIds);
        
        if (products.length > 0) {
            order.items.forEach(orderItem => {
                const productDetails = products.find(p => p.id === orderItem.productId);
                if (productDetails) {
                    addToCart(productDetails, orderItem.quantity);
                }
            });
            
            toast({
                title: "Items Added to Cart",
                description: "Your previous order has been added to your cart."
            });
            router.push('/cart');
        } else {
            toast({
                title: "Reorder Failed",
                description: "Could not find products from your previous order. They may no longer be available.",
                variant: "destructive"
            });
        }
    } catch (error) {
        toast({
            title: "Reorder Failed",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive"
        });
        console.error("Reorder error:", error);
    } finally {
        setReorderingId(null);
    }
  };

  const handleReturnRequest = async (order: Order) => {
    if (!user?.displayName || !user.email) {
        toast({
            title: "Cannot Request Return",
            description: "User information is missing.",
            variant: "destructive"
        });
        return;
    }

    setIsSubmittingReturn(order.id);
    try {
        const result = await createReturnRequest(order, user.displayName, user.email);
        if (result.success) {
            toast({
                title: "Return Request Submitted",
                description: result.message
            });
            if (user) {
                fetchReturnRequests(user.uid);
                fetchOrders(); // Re-fetch orders to show updated status
            }
        } else {
            throw new Error("Failed to submit return request");
        }
    } catch(error) {
        toast({
            title: "Request Failed",
            description: "Could not submit your return request. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsSubmittingReturn(null);
    }
  };

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'shipped': return 'default';
      case 'delivered': return 'secondary';
      case 'processing': return 'outline';
      case 'cancelled': return 'destructive';
      case 'return started': return 'default';
      case 'return completed': return 'secondary';
      case 'refunded': return 'secondary';
      default: return 'outline';
    }
  }

  const handleTrackClick = (order: Order) => {
    setSelectedOrder(order);
    setIsTrackingModalOpen(true);
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
                {orders.map((order) => {
                  const isReturnRequested = returnRequestIds.includes(order.id);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium truncate" style={{maxWidth: '100px'}}>{order.id}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                          <Badge variant={getStatusVariant(order.status)} className="capitalize">{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                      <TableCell className="flex justify-center items-center gap-2">
                          <Button variant="outline" size="sm" title="Track Order" onClick={() => handleTrackClick(order)} disabled={!order.trackingNumber || !order.carrier}>
                            <Truck className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" title="Reorder" onClick={() => handleReorder(order)} disabled={reorderingId === order.id}>
                            {reorderingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Repeat className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            title={isReturnRequested ? "Return Already Requested" : "Request Return"} 
                            onClick={() => handleReturnRequest(order)} 
                            disabled={order.status !== 'delivered' || isReturnRequested || isSubmittingReturn === order.id}
                          >
                            {isSubmittingReturn === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                          </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                </TableBody>
            </Table>
          )}
        </CardContent>
        <TrackingInfoModal
            order={selectedOrder}
            isOpen={isTrackingModalOpen}
            onClose={() => setIsTrackingModalOpen(false)}
        />
      </Card>
  );
}
