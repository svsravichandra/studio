
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Product, type Subscription } from "@/lib/types";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, getDocs, collection, query, where, documentId, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

async function getSubscriptionProducts(productIds: string[]): Promise<Product[]> {
    if (!db || productIds.length === 0) return [];
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where(documentId(), 'in', productIds));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error("Error fetching subscription products:", error);
        return [];
    }
}

export default function SubscriptionsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const fetchSubscription = async () => {
            if (!user || !db) {
                setIsLoading(false);
                return;
            };
            setIsLoading(true);
            const subRef = doc(db, `users/${user.uid}/subscriptions`, 'active_subscription');
            try {
                const docSnap = await getDoc(subRef);
                if (docSnap.exists()) {
                    const subData = { id: docSnap.id, ...docSnap.data() } as Subscription;
                    setSubscription(subData);
                    const productDetails = await getSubscriptionProducts(subData.items);
                    setProducts(productDetails);
                } else {
                    setSubscription(null);
                    setProducts([]);
                }
            } catch (error) {
                console.error("Error fetching subscription: ", error);
                setSubscription(null);
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        }
        fetchSubscription();
    }, [user]);

    const createDefaultSubscription = async () => {
        if (!user || !db) return;
        setIsCreating(true);

        const nextDeliveryDate = new Date();
        nextDeliveryDate.setMonth(nextDeliveryDate.getMonth() + 1);

        const defaultProductIds = ['timber-trail', 'whiskey-oak'];

        const defaultSubscription: Omit<Subscription, 'id'> = {
            userId: user.uid,
            active: true,
            frequency: 'monthly',
            nextDelivery: nextDeliveryDate.toISOString(),
            items: defaultProductIds,
            createdAt: serverTimestamp(),
        };

        try {
            const subRef = doc(db, `users/${user.uid}/subscriptions`, 'active_subscription');
            await setDoc(subRef, defaultSubscription);
            
            const subData = { id: 'active_subscription', ...defaultSubscription } as Subscription;
            setSubscription(subData);
            const productDetails = await getSubscriptionProducts(subData.items);
            setProducts(productDetails);

            toast({
                title: "Subscription Started!",
                description: "Your Gritbox is now active."
            });
        } catch (error) {
            console.error("Error creating subscription:", error);
            toast({
                title: "Error",
                description: "Could not start your subscription. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    };
    
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
                    <Button className="mt-4" onClick={createDefaultSubscription} disabled={isCreating}>
                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Start a Gritbox Subscription
                    </Button>
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
            <Badge variant={subscription.active ? 'default' : 'secondary'} className="text-base">
                {subscription.active ? 'Active' : 'Paused'}
            </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
                <h4 className="font-headline uppercase">Current Products</h4>
                <div className="mt-2 space-y-3">
                    {products.map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                            <Image src={item.imageUrl} alt={item.name} width={50} height={50} className="rounded-md object-cover" data-ai-hint={item.tags.join(' ')}/>
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
                        <span className="capitalize">{subscription.frequency}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Next Delivery:</span>
                        <span>{new Date(subscription.nextDelivery).toLocaleDateString()}</span>
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
