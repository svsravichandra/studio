
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import type { Subscription } from '@/lib/types';
import { updateSubscriptionPaymentMethod } from './actions';

interface ChangePaymentModalProps {
  subscription: Subscription;
  onSuccess: () => void;
  onClose: () => void;
}

// Same mock data from other pages
const mockPaymentMethods = [
    { id: 'pm_1', type: 'Visa', last4: '4242', isDefault: true },
    { id: 'pm_2', type: 'Mastercard', last4: '1234', isDefault: false },
]

export function ChangePaymentModal({ subscription, onSuccess, onClose }: ChangePaymentModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(subscription.paymentMethodId);
  const [isPending, startTransition] = useTransition();
  
  const handleSave = () => {
    if (!user || !selectedPaymentMethodId) {
        toast({ title: 'Error', description: 'Please select a payment method.', variant: 'destructive' });
        return;
    }

    startTransition(async () => {
      try {
        const result = await updateSubscriptionPaymentMethod({ userId: user.uid, paymentMethodId: selectedPaymentMethodId });
        if (result.success) {
          toast({ title: 'Success', description: result.message });
          onSuccess();
        } else {
          throw new Error('Failed to update payment method');
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Could not update your payment method. Please try again.', variant: 'destructive' });
      }
    });
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="font-headline uppercase">Change Payment Method</DialogTitle>
        <DialogDescription>
          Select a new payment method for your recurring Gritbox subscription.
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-4">
        <RadioGroup value={selectedPaymentMethodId} onValueChange={setSelectedPaymentMethodId} className="space-y-3">
          {mockPaymentMethods.map(method => (
            <Label
              key={method.id}
              htmlFor={method.id}
              className="flex items-center justify-between p-4 bg-background border border-border/50 rounded-lg has-[:checked]:border-primary cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{method.type} ending in {method.last4}</p>
                  {method.isDefault && <p className="text-xs text-primary">Default</p>}
                </div>
              </div>
              <RadioGroupItem value={method.id} id={method.id} />
            </Label>
          ))}
        </RadioGroup>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={isPending || !selectedPaymentMethodId || selectedPaymentMethodId === subscription.paymentMethodId}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Payment Method
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
