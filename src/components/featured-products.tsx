'use client';

import type { Product } from '@/lib/types';
import { useCart } from '@/context/cart-context';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const { addToCart } = useCart();
  
  if (!products || products.length === 0) {
    return (
      <div className="mt-12 text-center py-16 text-muted-foreground">
        <p>No featured products found.</p>
        <p className="text-sm mt-2">Make sure products are marked as 'featured' in the database via the admin dashboard.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12 text-left">
        {products.map((product) => (
          <div key={product.id} className="bg-background border border-border/50 rounded-lg flex flex-col overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
            <Image src={product.imageUrl} alt={product.name} width={400} height={400} className="w-full aspect-square object-cover" data-ai-hint={product.tags.join(' ')} />
            <div className="p-4 flex flex-col flex-grow">
              <h4 className="font-headline text-xl uppercase">{product.name}</h4>
              <p className="text-sm text-muted-foreground mt-1 flex-grow">{product.description}</p>
              <div className="flex justify-between items-center mt-4">
                <p className="text-lg font-headline text-primary">${product.price.toFixed(2)}</p>
                <Button variant="outline" size="sm" className="text-xs uppercase tracking-widest" onClick={() => addToCart(product)}>Add To Cart</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Link href="/products">
        <Button variant="outline" size="lg" className="mt-12 uppercase tracking-widest">View All Products</Button>
      </Link>
    </>
  );
}
