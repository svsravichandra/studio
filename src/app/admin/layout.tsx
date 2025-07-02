'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Fingerprint, Package, ShoppingCart, Users, Undo2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { ReactNode, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const adminNavItems = [
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/returns', label: 'Returns', icon: Undo2 },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-4">Verifying admin access...</p>
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
              <Fingerprint className="h-10 w-10 text-primary" />
              <div>
                <p className="font-headline text-lg">Admin Panel</p>
                <p className="text-sm text-muted-foreground">{user.displayName}</p>
              </div>
            </div>
            <nav className="flex flex-col gap-2">
              {adminNavItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
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
            </nav>
          </div>
        </aside>
        <main className="md:col-span-3">{children}</main>
      </div>
    </div>
  );
}
