
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/lib/types';
import { Truck } from 'lucide-react';
import Link from 'next/link';

interface TrackingInfoModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const getTrackingUrl = (carrier?: string, trackingNumber?: string) => {
    if (!carrier || !trackingNumber) return null;

    const formattedCarrier = carrier.toLowerCase();
    if (formattedCarrier === 'ups') {
        return `https://www.ups.com/track?loc=en_US&tracknum=${trackingNumber}`;
    }
    if (formattedCarrier === 'usps') {
        return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
    }
    if (formattedCarrier === 'fedex') {
        return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
    }
    return null; // For 'Other' or unknown carriers
}

export function TrackingInfoModal({ order, isOpen, onClose }: TrackingInfoModalProps) {
  if (!order) return null;

  const trackingUrl = getTrackingUrl(order.carrier, order.trackingNumber);

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'shipped': return 'default';
      case 'delivered': return 'secondary';
      case 'processing': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline uppercase flex items-center gap-2"><Truck className="h-6 w-6 text-primary" /> Tracking Details</DialogTitle>
          <DialogDescription>
            Order ID: <span className="font-mono">{order.id}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
            {order.trackingNumber && order.carrier ? (
                <>
                    <div className="flex flex-col items-center justify-center p-6 bg-background rounded-lg border">
                        <p className="text-sm text-muted-foreground">Carrier</p>
                        <p className="text-2xl font-bold uppercase">{order.carrier}</p>
                        <p className="text-sm text-muted-foreground mt-4">Tracking Number</p>
                        <p className="text-2xl font-mono font-bold text-primary break-all">{order.trackingNumber}</p>
                    </div>
                    
                    {trackingUrl ? (
                         <Button asChild className="w-full">
                            <Link href={trackingUrl} target="_blank" rel="noopener noreferrer">
                                Track on {order.carrier} Website
                            </Link>
                        </Button>
                    ) : (
                        <p className="text-sm text-center text-muted-foreground">
                            Live tracking is not available for this carrier.
                        </p>
                    )}
                   
                </>
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                    <p>Tracking information is not yet available for this order.</p>
                    <p className="text-sm">It will appear here once the order has shipped.</p>
                </div>
            )}
             <div className="text-center">
                <p className="text-sm text-muted-foreground">Current Status</p>
                <Badge variant={getStatusVariant(order.status)} className="capitalize text-base mt-1">{order.status}</Badge>
            </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
