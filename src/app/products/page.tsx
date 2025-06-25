'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/lib/types";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function ProductsPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!db) {
        setIsLoading(false);
        return;
      };
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData: Product[] = [];
        querySnapshot.forEach((doc) => {
          productsData.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-headline uppercase">Our <span className="text-primary">Collection</span></h1>
          <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
            Explore our full range of handcrafted soaps, engineered for excellence.
          </p>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
