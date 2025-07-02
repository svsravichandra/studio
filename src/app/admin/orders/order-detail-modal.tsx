
'use client';

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/lib/types';
import { Printer, PackageCheck, Ban, Truck } from 'lucide-react';
import Image from 'next/image';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateOrderStatus } from '@/app/admin/actions';

type OrderWithUser = Order & { user: { id: string; name: string; email: string } };

interface OrderDetailModalProps {
  order: OrderWithUser | null;
  onUpdate: () => void;
  onClose: () => void;
}

export function OrderDetailModal({ order, onUpdate }: OrderDetailModalProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
    
  if (!order) return null;
  
  const handleStatusChange = (status: Order['status']) => {
    startTransition(async () => {
      try {
        const result = await updateOrderStatus({ orderId: order.id, status });
        if (result.success) {
          toast({ title: "Success", description: result.message });
          onUpdate(); // This will refetch orders and update the modal's state via props
        } else {
           throw new Error("Failed to update status");
        }
      } catch (error) {
        toast({ title: "Error", description: "Could not update order status.", variant: "destructive" });
      }
    });
  };

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'shipped': return 'default';
      case 'delivered': return 'secondary';
      case 'processing': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const handlePrint = () => {
    // In a real app, this would trigger a print-friendly view or generate a PDF.
    // For now, we can just use the browser's print functionality.
    window.print();
  };

  return (
    <DialogContent className="sm:max-w-3xl print:sm:max-w-full print:border-none print:shadow-none">
      <DialogHeader className="print:hidden">
        <DialogTitle className="font-headline uppercase">Order Details</DialogTitle>
        <DialogDescription>
          Order ID: <span className="font-mono">{order.id}</span>
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-4 max-h-[70vh] overflow-y-auto print:max-h-full print:overflow-visible">
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <h4 className="font-headline mb-2 text-lg">Order Items</h4>
                <div className="space-y-3 rounded-lg border p-4 bg-background">
                    {order.items.map((item) => (
                        <div key={item.productId} className="flex items-center gap-4">
                            <Image src={item.imageUrl} alt={item.name} width={60} height={60} className="rounded-md object-cover border"/>
                            <div className="flex-grow">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                    <Separator />
                     <div className="flex justify-end font-bold text-lg">
                        Total: <span className="text-primary ml-2">${order.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="font-headline mb-2 text-lg">Customer</h4>
                <div className="text-sm rounded-lg border p-4 space-y-1 bg-background">
                    <p className="font-semibold">{order.user.name}</p>
                    <p className="text-muted-foreground">{order.user.email}</p>
                    <p className="text-muted-foreground pt-2">
                        {order.shippingAddress.line1}<br/>
                        {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br/></>}
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br/>
                        {order.shippingAddress.country}
                    </p>
                </div>

                <h4 className="font-headline mt-4 mb-2 text-lg">Status</h4>
                <div className="rounded-lg border p-4 bg-background">
                    <Badge variant={getStatusVariant(order.status)} className="capitalize text-base">{order.status}</Badge>
                </div>

                 <div className="mt-4 print:hidden">
                    <h4 className="font-headline mb-2 text-lg">Tracking</h4>
                    <div className="flex items-end gap-2">
                        <div className="flex-grow">
                            <Label htmlFor="tracking-number" className="sr-only">Tracking Number</Label>
                            <Input id="tracking-number" placeholder="Enter tracking number" disabled={isPending} className="bg-background"/>
                        </div>
                        <Button disabled={isPending}>Update</Button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <DialogFooter className="mt-2 flex-wrap gap-2 justify-end print:hidden">
        <Button variant="outline" onClick={handlePrint} disabled={isPending}><Printer className="mr-2 h-4 w-4" /> Print Invoice</Button>
        <Button variant="secondary" onClick={() => handleStatusChange('shipped')} disabled={isPending || order.status === 'shipped' || order.status === 'delivered'}><Truck className="mr-2 h-4 w-4" /> Mark as Shipped</Button>
        <Button variant="secondary" onClick={() => handleStatusChange('delivered')} disabled={isPending || order.status === 'delivered'}><PackageCheck className="mr-2 h-4 w-4" /> Mark as Delivered</Button>
        <Button variant="destructive" onClick={() => handleStatusChange('cancelled')} disabled={isPending || order.status === 'cancelled'}><Ban className="mr-2 h-4 w-4" /> Cancel Order</Button>
      </DialogFooter>
    </DialogContent>
  );
}
