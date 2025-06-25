import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 text-left">
          <div>
            <h4 className="text-2xl font-headline uppercase tracking-wider">Grit & Co.</h4>
            <p className="text-sm text-muted-foreground mt-4">Premium handcrafted bar soap for the modern man. Made with natural ingredients sourced from Californian forests.</p>
            <div className="flex space-x-4 mt-4">
              <a href="#" aria-label="Facebook"><Facebook className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" /></a>
              <a href="#" aria-label="Instagram"><Instagram className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" /></a>
            </div>
          </div>
          <div>
            <h5 className="font-headline uppercase tracking-widest text-primary">Shop</h5>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground">All Products</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">The Gritbox Subscription</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-headline uppercase tracking-widest text-primary">Support</h5>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Shipping Info</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">Returns</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground">FAQ</a></li>
            </ul>
          </div>
           <div>
            <h5 className="font-headline uppercase tracking-widest text-primary">Stay in touch</h5>
            <p className="text-sm text-muted-foreground mt-4">Get exclusive deals and updates delivered to your inbox.</p>
            <form className="flex gap-2 mt-4">
              <Input type="email" placeholder="Enter your email" className="bg-background border-border" />
              <Button type="submit" variant="outline" className="whitespace-nowrap">Sign Up</Button>
            </form>
          </div>
        </div>
        <div className="border-t border-border/50 mt-8 pt-6 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Grit & Co. All Rights Reserved. <a href="#" className="hover:text-foreground">Privacy Policy</a> | <a href="#" className="hover:text-foreground">Terms of Service</a></p>
        </div>
      </div>
    </footer>
  );
}
