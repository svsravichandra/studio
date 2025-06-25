'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CreditCard, History, LogOut, UserRound, Repeat, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { ReactNode, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const dashboardNavItems = [
  { href: '/dashboard/profile', label: 'Profile', icon: UserRound },
  { href: '/dashboard/orders', label: 'Orders', icon: History },
  { href: '/dashboard/subscriptions', label: 'Subscriptions', icon: Repeat },
  { href: '/dashboard/payment-methods', label: 'Payment Methods', icon: CreditCard },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid md:grid-cols-4 gap-12">
        <aside className="md:col-span-1 h-fit sticky top-24">
          <div className="bg-card p-4 rounded-lg border border-border/50">
             <div className="flex items-center gap-4 p-4 border-b border-border/50 mb-4">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                    <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-grow truncate">
                    <p className="font-headline text-lg truncate">{user.displayName}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
            </div>
            <nav className="flex flex-col gap-2">
              {dashboardNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link href={item.href} key={item.label}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className="w-full justify-start gap-3"
                    >
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
               <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={signOut}
              >
                <LogOut className="h-5 w-5 text-muted-foreground" />
                <span>Sign Out</span>
              </Button>
            </nav>
          </div>
        </aside>
        <main className="md:col-span-3">{children}</main>
      </div>
    </div>
  );
}
