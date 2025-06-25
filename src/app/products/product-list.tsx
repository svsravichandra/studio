'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/lib/types";

interface ProductListProps {
    products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  const { addToCart } = useCart();
  
  if (!products || products.length === 0) {
      return (
          <div className="text-center py-16 text-muted-foreground">
              <p>No products found.</p>
              <p className="text-sm mt-2">This could be because the database is empty or there was an issue fetching data.</p>
          </div>
      )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
      {products.map((product) => (
        <div key={product.id} className="bg-card border border-border/50 rounded-lg flex flex-col overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
          <Image src={product.image} alt={product.name} width={400} height={400} className="w-full h-auto object-cover" data-ai-hint={product.hint} />
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
  );
}
