'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Subscription } from "@/lib/types";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";


const mockSubscription: Subscription = {
  id: 'sub_123abc',
  status: 'Active',
  frequency: 'Monthly',
  nextBillingDate: '2024-08-15',
  products: [
    { id: 'whiskey-oak', name: 'Whiskey Oak', quantity: 1, price: 7.00, image: 'https://placehold.co/400x400.png', hint: 'whiskey soap' },
    { id: 'scrubby-grit', name: 'Scrubby Grit', quantity: 1, price: 7.00, image: 'https://placehold.co/400x400.png', hint: 'coffee soap' },
    { id: 'arctic-steel', name: 'Arctic Steel', quantity: 1, price: 7.00, image: 'https://placehold.co/400x400.png', hint: 'mint soap' }
  ],
  total: 21.00
}

export default function SubscriptionsPage() {
    const { user } = useAuth();
    // For now, we will continue using mock data for subscriptions as it's a more complex system.
    // We can implement this in a future step.
    const [subscription, setSubscription] = useState<Subscription | null>(mockSubscription);
    const [isLoading, setIsLoading] = useState(false);

    if (isLoading) {
        return (
            <Card className="bg-card border-border/50">
                <CardHeader>
                    <CardTitle className="font-headline uppercase text-2xl">Gritbox Subscription</CardTitle>
                    <CardDescription>Manage your monthly soap delivery.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }
    
    if (!subscription) {
        return (
             <Card className="bg-card border-border/50">
                <CardHeader>
                    <CardTitle className="font-headline uppercase text-2xl">Gritbox Subscription</CardTitle>
                    <CardDescription>Manage your monthly soap delivery.</CardDescription>
                </CardHeader>
                <CardContent className="text-center py-12 text-muted-foreground">
                    <p>You do not have an active subscription.</p>
                    <Button className="mt-4">Start a Gritbox Subscription</Button>
                </CardContent>
            </Card>
        );
    }


  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline uppercase text-2xl">Gritbox Subscription</CardTitle>
                <CardDescription>Manage your monthly soap delivery.</CardDescription>
            </div>
            <Badge variant={subscription.status === 'Active' ? 'default' : 'secondary'} className="text-base">
                {subscription.status}
            </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
                <h4 className="font-headline uppercase">Current Products</h4>
                <div className="mt-2 space-y-3">
                    {subscription.products.map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                            <Image src={item.image} alt={item.name} width={50} height={50} className="rounded-md" data-ai-hint={item.hint}/>
                            <p className="flex-grow">{item.name}</p>
                            <p className="text-muted-foreground">${item.price.toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </div>
             <div>
                <h4 className="font-headline uppercase">Details</h4>
                <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Frequency:</span>
                        <span>{subscription.frequency}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Next Billing Date:</span>
                        <span>{subscription.nextBillingDate}</span>
                    </div>
                     <div className="flex justify-between font-bold">
                        <span className="text-muted-foreground">Monthly Total:</span>
                        <span>${subscription.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <Separator className="my-6 bg-border/50" />

        <div>
            <h4 className="font-headline uppercase mb-4">Manage Plan</h4>
            <div className="flex flex-wrap gap-2">
                <Button>Manage Products</Button>
                <Button variant="secondary">Change Frequency</Button>
                <Button variant="outline">Pause Subscription</Button>
                <Button variant="destructive">Cancel Plan</Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
