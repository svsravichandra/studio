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
  
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
      {products.map((product) => (
        <div key={product.id} className="bg-card border border-border/50 rounded-lg flex flex-col overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
          <Image src={product.imageUrl} alt={product.name} width={400} height={400} className="w-full h-auto object-cover" data-ai-hint={product.tags.join(' ')} />
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
