
'use client';

import Link from 'next/link';
import { User, ShoppingCart, LogOut, LayoutGrid, Fingerprint } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from '@/context/cart-context';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { user, signOut, isAdmin } = useAuth();
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="text-2xl font-headline uppercase tracking-wider">Grit & Co.</Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm uppercase tracking-widest hover:text-primary transition-colors">Home</Link>
            <Link href="/products" className="text-sm uppercase tracking-widest hover:text-primary transition-colors">Shop</Link>
            <Link href="/dashboard/subscriptions" className="text-sm uppercase tracking-widest hover:text-primary transition-colors">Gritbox</Link>
            <a href="/#recommendations" className="text-sm uppercase tracking-widest hover:text-primary transition-colors">Recommend</a>
          </nav>
          <div className="flex items-center space-x-4">
            {user ? (
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                      <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                        <Link href="/admin">
                            <Fingerprint className="mr-2 h-4 w-4" />
                            <span>Admin Panel</span>
                        </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutGrid className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="hover:text-primary transition-colors"><User className="h-5 w-5" /></Link>
            )}
            <Link href="/cart" className="relative hover:text-primary transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-3 h-5 w-5 p-0 flex items-center justify-center text-xs">{totalItems}</Badge>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
