import Link from 'next/link';
import { User, ShoppingCart } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="text-2xl font-headline uppercase tracking-wider">Grit & Co.</Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm uppercase tracking-widest hover:text-primary transition-colors">Home</Link>
            <Link href="/products" className="text-sm uppercase tracking-widest hover:text-primary transition-colors">Shop</Link>
            <a href="/#gritbox" className="text-sm uppercase tracking-widest hover:text-primary transition-colors">Gritbox</a>
            <a href="/#recommendations" className="text-sm uppercase tracking-widest hover:text-primary transition-colors">Recommend</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="hover:text-primary transition-colors"><User className="h-5 w-5" /></Link>
            <Link href="/cart" className="hover:text-primary transition-colors"><ShoppingCart className="h-5 w-5" /></Link>
          </div>
        </div>
      </div>
    </header>
  );
}
