
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import type { Address } from "@/lib/types";

const addressSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
});

type FormValues = {
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  payment: {
    cardName: string;
    cardNumber: string;
    expiry: string;
    cvc: string;
  }
};

export default function CheckoutPage() {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user, userProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(z.object({
      shippingAddress: addressSchema,
      payment: z.object({ // Basic validation, not for production
        cardName: z.string().min(1, "Name on card is required"),
        cardNumber: z.string().min(1, "Card number is required"),
        expiry: z.string().min(1, "Expiry is required"),
        cvc: z.string().min(1, "CVC is required"),
      })
    })),
    defaultValues: {
      shippingAddress: {
        name: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        zip: "",
        country: "",
      },
      payment: {
        cardName: "",
        cardNumber: "",
        expiry: "",
        cvc: "",
      }
    }
  });

  useEffect(() => {
     if (userProfile) {
        reset({
            shippingAddress: {
                name: userProfile.name || "",
                line1: userProfile.address?.line1 || "",
                line2: userProfile.address?.line2 || "",
                city: userProfile.address?.city || "",
                state: userProfile.address?.state || "",
                zip: userProfile.address?.zip || "",
                country: userProfile.address?.country || "USA",
            },
            payment: {
              cardName: "",
              cardNumber: "",
              expiry: "",
              cvc: "",
            }
        })
     }
  }, [userProfile, reset])


  useEffect(() => {
    if (!authLoading && cartItems.length === 0) {
      router.push('/products');
    }
  }, [cartItems, router, authLoading]);

  const shipping = cartItems.length > 0 ? 5.00 : 0;
  const total = subtotal + shipping;
  
  const handlePlaceOrder = async (data: FormValues) => {
    if (!user || !db) {
        toast({
            title: "Error",
            description: "You must be logged in to place an order.",
            variant: "destructive"
        });
        router.push('/login');
        return;
    }

    setIsProcessing(true);

    const { name, ...shippingAddress } = data.shippingAddress;

    try {
        const ordersRef = collection(db, `users/${user.uid}/orders`);
        await addDoc(ordersRef, {
            userId: user.uid,
            createdAt: serverTimestamp(),
            status: 'processing',
            items: cartItems.map(item => ({
                productId: item.id,
                name: item.name,
                imageUrl: item.imageUrl,
                quantity: item.quantity,
                price: item.price,
            })),
            total,
            shippingAddress,
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
      <form onSubmit={handleSubmit(handlePlaceOrder)} className="grid md:grid-cols-2 gap-12">
        <div>
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="font-headline uppercase text-2xl">Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" {...register("shippingAddress.name")} className="bg-background" />
                {errors.shippingAddress?.name && <p className="text-xs text-destructive mt-1">{errors.shippingAddress.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="123 Grit St." {...register("shippingAddress.line1")} className="bg-background" />
                 {errors.shippingAddress?.line1 && <p className="text-xs text-destructive mt-1">{errors.shippingAddress.line1.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="San Francisco" {...register("shippingAddress.city")} className="bg-background" />
                   {errors.shippingAddress?.city && <p className="text-xs text-destructive mt-1">{errors.shippingAddress.city.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="state">State / Province</Label>
                  <Input id="state" placeholder="CA" {...register("shippingAddress.state")} className="bg-background" />
                   {errors.shippingAddress?.state && <p className="text-xs text-destructive mt-1">{errors.shippingAddress.state.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP / Postal Code</Label>
                  <Input id="zip" placeholder="94103" {...register("shippingAddress.zip")} className="bg-background" />
                   {errors.shippingAddress?.zip && <p className="text-xs text-destructive mt-1">{errors.shippingAddress.zip.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="USA" {...register("shippingAddress.country")} className="bg-background" />
                   {errors.shippingAddress?.country && <p className="text-xs text-destructive mt-1">{errors.shippingAddress.country.message}</p>}
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
                <Input id="card-name" placeholder="John M. Doe" {...register("payment.cardName")} className="bg-background" />
                 {errors.payment?.cardName && <p className="text-xs text-destructive mt-1">{errors.payment.cardName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input id="card-number" placeholder="**** **** **** 1234" {...register("payment.cardNumber")} className="bg-background" />
                 {errors.payment?.cardNumber && <p className="text-xs text-destructive mt-1">{errors.payment.cardNumber.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiration</Label>
                  <Input id="expiry" placeholder="MM/YY" {...register("payment.expiry")} className="bg-background" />
                   {errors.payment?.expiry && <p className="text-xs text-destructive mt-1">{errors.payment.expiry.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" {...register("payment.cvc")} className="bg-background" />
                   {errors.payment?.cvc && <p className="text-xs text-destructive mt-1">{errors.payment.cvc.message}</p>}
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
              <Button type="submit" size="lg" className="w-full mt-6 uppercase tracking-widest" disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
