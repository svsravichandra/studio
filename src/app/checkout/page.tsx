'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/cart-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && cartItems.length === 0) {
      router.push('/products');
    }
  }, [cartItems, router, authLoading]);

  const shipping = cartItems.length > 0 ? 5.00 : 0;
  const total = subtotal + shipping;
  
  const handlePlaceOrder = async () => {
    if (!user || !db) {
        toast({
            title: "Error",
            description: "You must be logged in to place an order.",
            variant: "destructive"
        });
        return;
    }

    setIsProcessing(true);

    try {
        const ordersRef = collection(db, `users/${user.uid}/orders`);
        await addDoc(ordersRef, {
            createdAt: serverTimestamp(),
            status: 'Processing',
            items: cartItems,
            subtotal,
            shipping,
            total,
        });

        toast({
            title: "Order Placed!",
            description: "Your order has been successfully placed.",
        });
        clearCart();
        router.push('/dashboard/orders');
    } catch (error) {
        console.error("Error placing order: ", error);
        toast({
            title: "Order Failed",
            description: "There was an issue placing your order. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsProcessing(false);
    }
  }

  if (cartItems.length === 0 || authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground mt-4">Loading checkout...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-headline uppercase text-center mb-12">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="font-headline uppercase text-2xl">Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" defaultValue={user?.displayName || ''} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="123 Grit St." className="bg-background" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="San Francisco" className="bg-background" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="state">State / Province</Label>
                  <Input id="state" placeholder="CA" className="bg-background" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP / Postal Code</Label>
                  <Input id="zip" placeholder="94103" className="bg-background" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="USA" className="bg-background" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border/50 mt-8">
            <CardHeader>
              <CardTitle className="font-headline uppercase text-2xl">Payment Details</CardTitle>
              <CardDescription>All transactions are secure and encrypted.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="card-name">Name on Card</Label>
                <Input id="card-name" placeholder="John M. Doe" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input id="card-number" placeholder="**** **** **** 1234" className="bg-background" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiration</Label>
                  <Input id="expiry" placeholder="MM/YY" className="bg-background" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" className="bg-background" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="h-fit sticky top-24">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="font-headline uppercase text-2xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-4 bg-border/50" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <Separator className="my-4 bg-border/50" />
                <div className="flex justify-between font-headline text-lg uppercase">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
              <Button size="lg" className="w-full mt-6 uppercase tracking-widest" onClick={handlePlaceOrder} disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
