import { Check, Leaf, MapPin, Package, Star, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { RecommendationForm } from '@/components/recommendation-form';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FeaturedProducts } from '@/components/featured-products';
import { mapProduct } from '@/lib/mappers';

async function getFeaturedProducts(): Promise<{ products: Product[] } | { error: string }> {
  if (!db) {
    return { error: "Database connection failed. Please ensure your Firebase environment variables are set correctly." };
  }
  try {
    const productsRef = collection(db, "products");
    const querySnapshot = await getDocs(productsRef); // Fetch all products

    const allProducts: Product[] = querySnapshot.docs.map(mapProduct);
    
    // Filter for featured products in code and take the first 4
    const featuredProducts = allProducts.filter(p => p.isFeatured).slice(0, 4);

    return { products: JSON.parse(JSON.stringify(featuredProducts)) };
  } catch (error: any) {
    console.error("Error fetching featured products: ", error);
    const errorMessage = error.message || "An unknown error occurred";
    return { error: `Failed to fetch featured products. Details: ${errorMessage}` };
  }
}


export default async function Home() {
  const result = await getFeaturedProducts();

  return (
    <>
      <section 
        id="home" 
        className="relative h-[70vh] bg-cover bg-center text-center text-white flex items-center justify-center" 
        style={{ backgroundImage: "url('/hero-background.png')" }}
      >
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="relative z-20 flex flex-col items-center justify-center p-4">
          <h1 className="text-5xl md:text-7xl font-headline uppercase">
            Built for the <span className="text-primary">Rugged</span> Man
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-white/80">
            Premium handcrafted body soap engineered for men who work hard and live harder. Made with nature’s most powerful ingredients.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/products">
              <Button size="lg" className="bg-primary hover:bg-primary/80 text-primary-foreground uppercase tracking-widest">Shop Collection</Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="uppercase tracking-widest">New Scents</Button>
            </Link>
          </div>
        </div>
      </section>
      
      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="border border-primary/50 rounded-lg p-4 inline-block mb-4">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-headline text-lg uppercase">Handcrafted</h3>
              <p className="text-sm text-muted-foreground mt-2">Small batch, premium soap with natural ingredients from California forests.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="border border-primary/50 rounded-lg p-4 inline-block mb-4">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-headline text-lg uppercase">Natural Ingredients</h3>
              <p className="text-sm text-muted-foreground mt-2">We use honest, powerful natural ingredients that actually work.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="border border-primary/50 rounded-lg p-4 inline-block mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-headline text-lg uppercase">Free Shipping</h3>
              <p className="text-sm text-muted-foreground mt-2">On all orders over $50, we'll deliver your order for free.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="border border-primary/50 rounded-lg p-4 inline-block mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-headline text-lg uppercase">Made in California</h3>
              <p className="text-sm text-muted-foreground mt-2">Proudly created in California using locally sourced ingredients and workers.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="featured" className="bg-card py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-headline uppercase">Featured <span className="text-primary">Collection</span></h2>
          <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
            Discover our most popular handcrafted soaps, each designed for the modern man who demands quality.
          </p>
          {'error' in result ? (
            <div className="mt-12 text-center py-16 text-destructive-foreground bg-destructive/20 p-6 rounded-lg">
                <h3 className="text-2xl font-headline uppercase mb-2">Error Loading Products</h3>
                <p className="font-mono text-left bg-background/50 p-4 rounded-md whitespace-pre-wrap">{result.error}</p>
            </div>
           ) : (
            <FeaturedProducts products={result.products} />
           )}
        </div>
      </section>

      <section id="gritbox" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h2 className="text-4xl font-headline uppercase">Introducing <span className="text-primary">Gritbox</span></h2>
              <p className="text-muted-foreground mt-4">Never run out of premium soap again. Get 3 handcrafted bars delivered monthly, with the freedom to swap scents anytime.</p>
              <ul className="space-y-3 mt-6">
                <li className="flex items-center"><Check className="h-5 w-5 text-primary mr-3" /> 3-4 premium bars every month</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-primary mr-3" /> Swap scents anytime before deposit</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-primary mr-3" /> It's off-the-grid pricing</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-primary mr-3" /> Free shipping always</li>
              </ul>
              <div className="mt-8 flex gap-4">
                <Link href="/dashboard/subscriptions">
                  <Button size="lg" className="bg-primary hover:bg-primary/80 uppercase tracking-widest">Start my Gritbox - $20/month</Button>
                </Link>
                <Button size="lg" variant="outline" className="uppercase tracking-widest">Learn More</Button>
              </div>
            </div>
            <div>
              <Image src="https://placehold.co/600x600.png" alt="Gritbox subscription box" width={600} height={600} className="border border-border/50 rounded-lg shadow-lg" data-ai-hint="subscription box" />
            </div>
          </div>
        </div>
      </section>

      <section id="recommendations" className="py-20 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-headline uppercase">Need a <span className="text-primary">Recommendation?</span></h2>
          <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
            Let our AI guide you to the perfect soap based on your preferences.
          </p>
          <div className="mt-12 max-w-4xl mx-auto">
            <RecommendationForm />
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-headline uppercase">What Men Are <span className="text-primary">Saying</span></h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12 text-left">
            {[
              { name: 'John M.', title: 'Construction Worker', review: "Finally found a soap that actually works for my tough hands. The Timber & Smoke is my new #1. My wife loves the scent too." },
              { name: 'Marcus K.', title: 'Outdoor Guide', review: "The Gritbox subscription is perfect because I never have to think about running out, and I love trying different scents every month." },
              { name: 'David L.', title: 'Firefighter', review: "Been using the Arctic Steel soap for months. Makes me feel better than coffee. Really is incredible." },
            ].map((testimonial) => (
              <div key={testimonial.name} className="bg-card border border-border/50 rounded-lg p-6 shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-primary fill-primary" />)}
                </div>
                <p className="text-muted-foreground italic">"{testimonial.review}"</p>
                <p className="font-headline text-lg mt-4 uppercase">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
