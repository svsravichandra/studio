
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Product, type Subscription } from "@/lib/types";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState, useTransition, useCallback } from "react";
import { doc, getDoc, setDoc, getDocs, collection, query, where, documentId, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
    cancelSubscription,
    updateSubscriptionFrequency,
    updateSubscriptionStatus
} from "./actions";
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { ManageSubscriptionProducts } from './manage-products';
import { getAllProducts as fetchAllStoreProducts } from '@/app/admin/actions';


async function getSubscriptionProducts(productIds: string[]): Promise<Product[]> {
    if (!db || productIds.length === 0) return [];
    try {
        const productsRef = collection(db, 'products');
        // Firestore 'in' queries are limited to 30 items. If the subscription can have more, this needs batching.
        const productIdsInChunks: string[][] = [];
        for (let i = 0; i < productIds.length; i += 30) {
            productIdsInChunks.push(productIds.slice(i, i + 30));
        }
        
        const productPromises = productIdsInChunks.map(chunk => {
             const q = query(productsRef, where(documentId(), 'in', chunk));
             return getDocs(q);
        });

        const productSnapshots = await Promise.all(productPromises);
        const products: Product[] = [];
        productSnapshots.forEach(snapshot => {
            snapshot.docs.forEach(doc => {
                 products.push({ id: doc.id, ...doc.data() } as Product);
            });
        });

        // Preserve original order from subscription
        return productIds.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];

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
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isManageOpen, setIsManageOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const fetchSubscriptionData = useCallback(async () => {
        if (!user || !db) {
            setIsLoading(false);
            return;
        };
        setIsLoading(true);
        try {
            const subRef = doc(db, 'subscriptions', user.uid);
            
            const [docSnap, allProductsData] = await Promise.all([
                getDoc(subRef),
                fetchAllStoreProducts()
            ]);

            setAllProducts(allProductsData);

            if (docSnap.exists()) {
                const subData = { id: docSnap.id, ...docSnap.data() } as Subscription;
                setSubscription(subData);
                if (subData.items && subData.items.length > 0) {
                  const productDetails = await getSubscriptionProducts(subData.items);
                  setProducts(productDetails);
                }
            } else {
                setSubscription(null);
                setProducts([]);
            }
        } catch (error) {
            console.error("Error fetching subscription data: ", error);
            setSubscription(null);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchSubscriptionData();
        }
    }, [user, fetchSubscriptionData]);

    const createDefaultSubscription = async () => {
        if (!user || !db) return;
        setIsCreating(true);

        const nextDeliveryDate = new Date();
        nextDeliveryDate.setMonth(nextDeliveryDate.getMonth() + 1);

        const defaultProductIds = ['timber-trail', 'whiskey-oak', 'arctic-steel'];

        const defaultSubscription: Omit<Subscription, 'id'> = {
            userId: user.uid,
            active: true,
            frequency: 'monthly',
            nextDelivery: nextDeliveryDate.toISOString(),
            items: defaultProductIds,
            createdAt: serverTimestamp(),
        };

        try {
            const subRef = doc(db, 'subscriptions', user.uid);
            await setDoc(subRef, defaultSubscription);
            
            // Refetch all data to ensure consistency
            await fetchSubscriptionData();

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
    
    const handleFrequencyChange = () => {
        if (!user || !subscription) return;
        const newFrequency = subscription.frequency === 'monthly' ? 'bi-monthly' : 'monthly';
        startTransition(async () => {
            try {
                await updateSubscriptionFrequency({ userId: user.uid, frequency: newFrequency });
                setSubscription(prev => prev ? { ...prev, frequency: newFrequency } : null);
                toast({ title: "Success", description: "Your subscription frequency has been updated." });
            } catch (error) {
                toast({ title: "Error", description: "Could not update frequency.", variant: "destructive" });
            }
        });
    };

    const handleStatusToggle = () => {
        if (!user || !subscription) return;
        const newStatus = !subscription.active;
        startTransition(async () => {
            try {
                await updateSubscriptionStatus({ userId: user.uid, active: newStatus });
                setSubscription(prev => prev ? { ...prev, active: newStatus } : null);
                toast({ title: "Success", description: `Your subscription has been ${newStatus ? 'resumed' : 'paused'}.` });
            } catch (error) {
                toast({ title: "Error", description: "Could not update subscription status.", variant: "destructive" });
            }
        });
    };

    const handleCancel = () => {
        if (!user) return;
        startTransition(async () => {
            try {
                await cancelSubscription({ userId: user.uid });
                setSubscription(null);
                setProducts([]);
                toast({ title: "Subscription Cancelled", description: "We're sorry to see you go." });
            } catch (error) {
                toast({ title: "Error", description: "Could not cancel subscription.", variant: "destructive" });
            }
        });
    };

    const handleManageSuccess = () => {
        setIsManageOpen(false);
        fetchSubscriptionData();
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
    <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
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
                        {products.length > 0 ? products.map(item => (
                            <div key={item.id} className="flex items-center gap-3">
                                <Image src={item.imageUrl} alt={item.name} width={50} height={50} className="rounded-md object-cover" data-ai-hint={item.tags.join(' ')}/>
                                <p className="flex-grow">{item.name}</p>
                                <p className="text-muted-foreground">${item.price.toFixed(2)}</p>
                            </div>
                        )) : <p className="text-sm text-muted-foreground">No products in your subscription.</p>}
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
                    <DialogTrigger asChild>
                        <Button disabled={isPending || !subscription.active}>Manage Products</Button>
                    </DialogTrigger>
                    <Button variant="secondary" onClick={handleFrequencyChange} disabled={isPending || !subscription.active}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Switch to {subscription.frequency === 'monthly' ? 'Bi-Monthly' : 'Monthly'}
                    </Button>
                    <Button variant="outline" onClick={handleStatusToggle} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {subscription.active ? 'Pause Subscription' : 'Resume Subscription'}
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isPending}>Cancel Plan</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently cancel your Gritbox subscription.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Keep My Subscription</AlertDialogCancel>
                                <AlertDialogAction onClick={handleCancel} className="bg-destructive hover:bg-destructive/90">
                                    Yes, Cancel My Plan
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </CardContent>
        </Card>
        
        {subscription && allProducts.length > 0 && (
            <ManageSubscriptionProducts
                allProducts={allProducts}
                currentProductIds={subscription.items}
                onSuccess={handleManageSuccess}
                onClose={() => setIsManageOpen(false)}
            />
        )}
    </Dialog>
  );
}
