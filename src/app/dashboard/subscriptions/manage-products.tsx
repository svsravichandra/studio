
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Product } from '@/lib/types';
import { updateSubscriptionItems } from './actions';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ManageSubscriptionProductsProps {
  allProducts: Product[];
  currentProductIds: string[];
  onSuccess: () => void;
  onClose: () => void;
}

export function ManageSubscriptionProducts({ allProducts, currentProductIds, onSuccess, onClose }: ManageSubscriptionProductsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>(currentProductIds);
  const [isPending, startTransition] = useTransition();
  const subscriptionProductCount = 3; // The Gritbox contains 3 bars

  const handleCheckboxChange = (productId: string, checked: boolean) => {
    setSelectedIds(prev => {
      if (checked) {
        if (prev.length >= subscriptionProductCount) {
          toast({
            title: `You can only select ${subscriptionProductCount} products.`,
            variant: "destructive"
          });
          return prev;
        }
        return [...prev, productId];
      } else {
        return prev.filter(id => id !== productId);
      }
    });
  };

  const handleSave = () => {
    if (!user) return;
    if (selectedIds.length !== subscriptionProductCount) {
       toast({
            title: `You must select exactly ${subscriptionProductCount} products.`,
            description: `You have selected ${selectedIds.length}.`,
            variant: "destructive"
        });
        return;
    }

    startTransition(async () => {
      try {
        const result = await updateSubscriptionItems({ userId: user.uid, items: selectedIds });
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

  const selectedProducts = allProducts.filter(p => selectedIds.includes(p.id));

  return (
    <DialogContent className="sm:max-w-[800px]">
      <DialogHeader>
        <DialogTitle className="font-headline uppercase">Manage Your Gritbox Products</DialogTitle>
        <DialogDescription>
          Select {subscriptionProductCount} bars for your next delivery. Your changes will apply to your next shipment.
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid md:grid-cols-2 gap-6 py-4">
        <div>
          <h4 className="font-headline mb-2 text-base">Available Products</h4>
          <ScrollArea className="h-96 pr-4 border rounded-md">
            <div className="p-4 space-y-4">
              {allProducts.map(product => (
                <div key={product.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`select-${product.id}`}
                    checked={selectedIds.includes(product.id)}
                    onCheckedChange={(checked) => handleCheckboxChange(product.id, !!checked)}
                    disabled={!selectedIds.includes(product.id) && selectedIds.length >= subscriptionProductCount}
                  />
                  <label htmlFor={`select-${product.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-grow cursor-pointer">
                    {product.name}
                  </label>
                  <span className="text-sm text-muted-foreground">${product.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <div>
          <h4 className="font-headline mb-2 text-base">Your Next Gritbox ({selectedIds.length}/{subscriptionProductCount})</h4>
          <div className="h-96 p-4 border rounded-md space-y-3 bg-background flex flex-col">
             {selectedProducts.length > 0 ? (
                selectedProducts.map(product => (
                  <div key={`selected-${product.id}`} className="flex items-center gap-3">
                      <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint={product.tags.join(' ')} />
                      <p className="flex-grow text-sm">{product.name}</p>
                      <Button variant="ghost" size="sm" onClick={() => handleCheckboxChange(product.id, false)} className="text-muted-foreground hover:text-destructive">Remove</Button>
                  </div>
                ))
            ) : (
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-sm text-muted-foreground text-center">Select products from the list on the left.</p>
                </div>
            )}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={isPending || selectedIds.length !== subscriptionProductCount}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
