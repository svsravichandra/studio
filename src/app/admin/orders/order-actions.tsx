'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Truck, Undo, PackageCheck, Ban, PackageX, CircleDollarSign } from "lucide-react";
import { type Order } from "@/lib/types";
import { updateOrderStatus } from "@/app/admin/actions";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition } from "react";

type OrderWithUser = Order & { user: { id: string; name: string; email: string } };

export function OrderActions({ order }: { order: OrderWithUser }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: Order['status']) => {
    startTransition(async () => {
      try {
        const result = await updateOrderStatus({ userId: order.userId, orderId: order.id, status });
        if (result.success) {
          toast({ title: "Success", description: result.message });
        } else {
           throw new Error("Failed to update status");
        }
      } catch (error) {
        toast({ title: "Error", description: "Could not update order status.", variant: "destructive" });
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleStatusChange('Shipped')}>
          <Truck className="mr-2 h-4 w-4" />
          Mark as Shipped
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('Delivered')}>
          <PackageCheck className="mr-2 h-4 w-4" />
          Mark as Delivered
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('Processing')}>
          <Undo className="mr-2 h-4 w-4" />
          Revert to Processing
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleStatusChange('Returned')}>
          <PackageX className="mr-2 h-4 w-4" />
          Mark as Returned
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('Refunded')}>
          <CircleDollarSign className="mr-2 h-4 w-4" />
          Mark as Refunded
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={() => handleStatusChange('Cancelled')}>
           <Ban className="mr-2 h-4 w-4" />
          Cancel Order
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
