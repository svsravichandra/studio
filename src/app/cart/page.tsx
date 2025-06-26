'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-context";

export default function CartPage() {
  const { cartItems, subtotal, updateQuantity, removeFromCart } = useCart();
  const shipping = cartItems.length > 0 ? 5.00 : 0;
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-headline uppercase text-center mb-12">Your <span className="text-primary">Cart</span></h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border/50 rounded-lg">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-headline uppercase">Your Cart is Empty</h2>
          <p className="text-muted-foreground mt-2">Looks like you haven't added anything to your cart yet.</p>
          <Link href="/products">
            <Button className="mt-6 uppercase tracking-widest">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <div className="flex flex-col gap-6">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border/50">
                  <Image src={item.imageUrl} alt={item.name} width={100} height={100} className="rounded-md" data-ai-hint={item.tags.join(' ')}/>
                  <div className="flex-grow">
                    <h2 className="font-headline text-lg uppercase">{item.name}</h2>
                    <p className="text-muted-foreground">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input type="number" value={item.quantity} className="w-16 h-8 text-center bg-background" readOnly />
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="font-headline text-lg w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="h-5 w-5"/>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border/50 h-fit">
            <h2 className="text-2xl font-headline uppercase mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <Separator className="my-2 bg-border/50" />
              <div className="flex justify-between font-headline text-lg uppercase">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
            <Link href="/checkout" className="w-full">
              <Button size="lg" className="w-full mt-6 uppercase tracking-widest">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
