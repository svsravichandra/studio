import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2 } from "lucide-react";

const cartItems = [
  { id: 1, name: 'Whiskey Oak', price: 9.00, quantity: 1, image: 'https://placehold.co/400x400.png', hint: 'whiskey soap' },
  { id: 2, name: 'Timber & Smoke', price: 9.00, quantity: 2, image: 'https://placehold.co/400x400.png', hint: 'charcoal soap' },
];

const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
const shipping = 5.00;
const total = subtotal + shipping;

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-headline uppercase text-center mb-12">Your <span className="text-primary">Cart</span></h1>
      
      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          <div className="flex flex-col gap-6">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border/50">
                <Image src={item.image} alt={item.name} width={100} height={100} className="rounded-md" data-ai-hint={item.hint}/>
                <div className="flex-grow">
                  <h2 className="font-headline text-lg uppercase">{item.name}</h2>
                  <p className="text-muted-foreground">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input type="number" value={item.quantity} className="w-16 h-8 text-center bg-background" readOnly />
                   <Button variant="outline" size="icon" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="font-headline text-lg w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
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
    </div>
  );
}
