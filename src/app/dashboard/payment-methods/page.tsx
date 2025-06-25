'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, PlusCircle } from "lucide-react";

const mockPaymentMethods = [
    { id: 'pm_1', type: 'Visa', last4: '4242', isDefault: true },
    { id: 'pm_2', type: 'Mastercard', last4: '1234', isDefault: false },
]

export default function PaymentMethodsPage() {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="font-headline uppercase text-2xl">Payment Methods</CardTitle>
        <CardDescription>Manage your saved payment information.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            {mockPaymentMethods.map(method => (
                 <div key={method.id} className="flex items-center justify-between p-4 bg-background border border-border/50 rounded-lg">
                    <div className="flex items-center gap-4">
                        <CreditCard className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <p className="font-medium">{method.type} ending in {method.last4}</p>
                            {method.isDefault && <p className="text-xs text-primary">Default</p>}
                        </div>
                    </div>
                    <Button variant="outline" size="sm">Remove</Button>
                </div>
            ))}
        </div>
        <Button className="mt-6">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Card
        </Button>
      </CardContent>
    </Card>
  );
}
