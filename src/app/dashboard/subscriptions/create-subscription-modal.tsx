
'use client';

import { useState, useTransition, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product, Subscription, SubscriptionProduct } from '@/lib/types';
import { createSubscription } from './actions';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Minus, Package, CalendarDays, CreditCard, DollarSign } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface CreateSubscriptionModalProps {
  allProducts: Product[];
  onSuccess: () => void;
  onClose: () => void;
}

const mockPaymentMethods = [
    { id: 'pm_1', type: 'Visa', last4: '4242', isDefault: true },
    { id: 'pm_2', type: 'Mastercard', last4: '1234', isDefault: false },
]
const defaultPaymentMethod = mockPaymentMethods.find(p => p.isDefault)!;
const subscriptionPrice = 20.00;

export function CreateSubscriptionModal({ allProducts, onSuccess, onClose }: CreateSubscriptionModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const subscriptionProductCount = 3;

  const [selectedItems, setSelectedItems] = useState<SubscriptionProduct[]>([]);
  const [frequency, setFrequency] = useState<Subscription['frequency']>('monthly');
  const [isPending, startTransition] = useTransition();

  const totalQuantity = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [selectedItems]);

  const handleQuantityChange = (productId: string, change: number) => {
    if (totalQuantity + change > subscriptionProductCount && change > 0) {
      toast({
        title: `Your Gritbox is full.`,
        description: `You can only have ${subscriptionProductCount} bars in your subscription.`,
        variant: "destructive"
      });
      return;
    }

    setSelectedItems(prev => {
      const existingItem = prev.find(item => item.productId === productId);
      let newItems;

      if (existingItem) {
        const newQuantity = existingItem.quantity + change;
        if (newQuantity > 0) {
          newItems = prev.map(item =>
            item.productId === productId ? { ...item, quantity: newQuantity } : item
          );
        } else {
          newItems = prev.filter(item => item.productId !== productId);
        }
      } else if (change > 0) {
        newItems = [...prev, { productId, quantity: change }];
      } else {
        return prev;
      }
      
      return newItems;
    });
  };

  const handleSave = () => {
    if (!user) return;
    if (totalQuantity !== subscriptionProductCount) {
       toast({
            title: `Check your quantities.`,
            description: `Your Gritbox must contain exactly ${subscriptionProductCount} bars. You currently have ${totalQuantity}.`,
            variant: "destructive"
        });
        return;
    }

    startTransition(async () => {
      try {
        const result = await createSubscription({
          userId: user.uid,
          items: selectedItems,
          frequency,
          paymentMethodId: defaultPaymentMethod.id,
        });
        if (result.success) {
          toast({ title: 'Success', description: result.message });
          onSuccess();
        } else {
          throw new Error('Failed to create subscription');
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Could not create your subscription. Please try again.', variant: 'destructive' });
      }
    });
  };
  
  const selectedProducts = useMemo(() => {
    return selectedItems.map(item => {
      const product = allProducts.find(p => p.id === item.productId);
      return { ...product, quantity: item.quantity } as Product & { quantity: number };
    }).filter(p => p.id);
  }, [selectedItems, allProducts]);

  return (
    <DialogContent className="sm:max-w-[800px]">
      <DialogHeader>
        <DialogTitle className="font-headline uppercase">Create Your Gritbox Subscription</DialogTitle>
        <DialogDescription>
          Choose your products and delivery frequency to get started. You can change these anytime.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4 items-center">
            <Label htmlFor="frequency" className="flex items-center gap-2 text-base">
                <CalendarDays className="h-5 w-5 text-primary" /> Delivery Frequency
            </Label>
            <Select value={frequency} onValueChange={(value: Subscription['frequency']) => setFrequency(value)}>
                <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="bi-monthly">Every 2 Months</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div>
            <h4 className="font-headline mb-2 text-base">Available Products</h4>
            <ScrollArea className="h-80 pr-4 border rounded-md">
                <div className="p-4 space-y-4">
                {allProducts.map(product => (
                    <div key={product.id} className="flex items-center space-x-3">
                        <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint={product.tags.join(' ')} />
                    <label htmlFor={`select-${product.id}`} className="text-sm font-medium leading-none flex-grow">
                        {product.name}
                    </label>
                    <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleQuantityChange(product.id, 1)}
                        disabled={totalQuantity >= subscriptionProductCount}
                    >
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                    </div>
                ))}
                </div>
            </ScrollArea>
            </div>
            <div>
            <h4 className="font-headline mb-2 text-base">Your First Gritbox ({totalQuantity}/{subscriptionProductCount})</h4>
            <div className="h-80 p-4 border rounded-md bg-background flex flex-col">
                {selectedProducts.length > 0 ? (
                    <ScrollArea className="flex-grow pr-2 -mr-2">
                        <div className="space-y-3">
                        {selectedProducts.map(product => (
                            <div key={`selected-${product.id}`} className="flex items-center gap-3">
                                <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint={product.tags.join(' ')} />
                                <p className="flex-grow text-sm">{product.name}</p>
                                <div className="flex items-center gap-1">
                                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(product.id, -1)}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input type="number" value={product.quantity} className="w-12 h-7 text-center bg-card" readOnly />
                                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleQuantityChange(product.id, 1)} disabled={totalQuantity >= subscriptionProductCount}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-center">
                        <div className="text-muted-foreground">
                            <Package className="h-10 w-10 mx-auto mb-2" />
                            <p className="text-sm">Your Gritbox is empty.</p>
                            <p className="text-xs">Add {subscriptionProductCount} products from the list on the left.</p>
                        </div>
                    </div>
                )}
            </div>
            </div>
        </div>
      </div>

      <Separator />

      <div className="py-4 space-y-4">
        <h4 className="font-headline text-base">Payment &amp; Authorization</h4>
        <div className="p-4 border rounded-md bg-background flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-primary" />
                    <div>
                        <p className="font-medium">Default Payment Method</p>
                        <p className="text-sm text-muted-foreground">{defaultPaymentMethod.type} ending in {defaultPaymentMethod.last4}</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" disabled>Change</Button>
            </div>
            <div className="flex justify-between items-center text-lg">
                <div className="flex items-center gap-3">
                    <DollarSign className="h-6 w-6 text-primary" />
                    <p className="font-medium">Subscription Total</p>
                </div>
                <p className="font-headline text-primary">${subscriptionPrice.toFixed(2)} / {frequency === 'monthly' ? 'month' : '2 months'}</p>
            </div>
        </div>
        <p className="text-xs text-muted-foreground">
            By clicking "Start My Subscription", you agree to our terms and authorize us to charge your default payment method on a recurring basis. You can cancel anytime.
        </p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={isPending || totalQuantity !== subscriptionProductCount}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Start My Subscription
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
