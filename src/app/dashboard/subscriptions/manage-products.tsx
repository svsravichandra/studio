
'use client';

import { useState, useTransition, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Product, SubscriptionProduct } from '@/lib/types';
import { updateSubscriptionItems } from './actions';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Minus, Package } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

interface ManageSubscriptionProductsProps {
  allProducts: Product[];
  currentItems: SubscriptionProduct[];
  onSuccess: () => void;
  onClose: () => void;
}

export function ManageSubscriptionProducts({ allProducts, currentItems, onSuccess, onClose }: ManageSubscriptionProductsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<SubscriptionProduct[]>(currentItems);
  const [isPending, startTransition] = useTransition();
  const subscriptionProductCount = 3;

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
        return prev; // No change
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
        const result = await updateSubscriptionItems({ userId: user.uid, items: selectedItems });
        if (result.success) {
          toast({ title: 'Success', description: 'Your Gritbox has been updated.' });
          onSuccess();
        } else {
          throw new Error('Failed to update subscription items');
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Could not update your products. Please try again.', variant: 'destructive' });
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
        <DialogTitle className="font-headline uppercase">Manage Your Gritbox Products</DialogTitle>
        <DialogDescription>
          Mix and match any {subscriptionProductCount} bars for your next delivery. Your changes will apply to your next shipment.
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid md:grid-cols-2 gap-6 py-4">
        <div>
          <h4 className="font-headline mb-2 text-base">Available Products</h4>
          <ScrollArea className="h-96 pr-4 border rounded-md">
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
          <h4 className="font-headline mb-2 text-base">Your Next Gritbox ({totalQuantity}/{subscriptionProductCount})</h4>
          <div className="h-96 p-4 border rounded-md space-y-3 bg-background flex flex-col">
             {selectedProducts.length > 0 ? (
                selectedProducts.map(product => (
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
                ))
            ) : (
                <div className="flex-grow flex items-center justify-center text-center">
                    <div className="text-muted-foreground">
                        <Package className="h-10 w-10 mx-auto mb-2" />
                        <p className="text-sm">Your Gritbox is empty.</p>
                        <p className="text-xs">Add products from the list on the left.</p>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={isPending || totalQuantity !== subscriptionProductCount}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
