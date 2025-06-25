'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/lib/types";

const products: Product[] = [
  { id: 'scrubby-grit', name: 'Scrubby Grit', description: 'Coffee & ground oats for a rugged, energizing morning scrub.', price: 8.00, image: 'https://placehold.co/400x400.png', hint: 'coffee soap' },
  { id: 'whiskey-oak', name: 'Whiskey Oak', description: 'Deep woody notes with an enticing and intoxicating aroma.', price: 9.00, image: 'https://placehold.co/400x400.png', hint: 'whiskey soap' },
  { id: 'arctic-steel', name: 'Arctic Steel', description: 'Mint and tea tree oils for a sharp, clean feeling all day long.', price: 8.00, image: 'https://placehold.co/400x400.png', hint: 'mint soap' },
  { id: 'timber-smoke', name: 'Timber & Smoke', description: 'Earthy birch tar and charcoal for a smoky, masculine scent.', price: 9.00, image: 'https://placehold.co/400x400.png', hint: 'charcoal soap' },
  { id: 'mountain-pine', name: 'Mountain Pine', description: 'A crisp scent of pine needles and fresh mountain air.', price: 8.00, image: 'https://placehold.co/400x400.png', hint: 'pine soap' },
  { id: 'coastal-driftwood', name: 'Coastal Driftwood', description: 'Salty sea air mixed with the warm, earthy scent of driftwood.', price: 9.00, image: 'https://placehold.co/400x400.png', hint: 'beach soap' },
  { id: 'spiced-tobacco', name: 'Spiced Tobacco', description: 'A rich blend of tobacco leaf, spices, and a hint of vanilla.', price: 9.00, image: 'https://placehold.co/400x400.png', hint: 'tobacco soap' },
  { id: 'black-pepper-birch', name: 'Black Pepper & Birch', description: 'A bold, spicy scent with a woody backbone of birch.', price: 8.00, image: 'https://placehold.co/400x400.png', hint: 'pepper soap' },
];

export default function ProductsPage() {
  const { addToCart } = useCart();

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-headline uppercase">Our <span className="text-primary">Collection</span></h1>
          <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
            Explore our full range of handcrafted soaps, engineered for excellence.
          </p>
        </div>
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
      </div>
    </div>
  );
}
