import { Check, Package, Leaf, Truck, MapPin, Star, User, ShoppingCart, Facebook, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-body bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <a href="#" className="text-2xl font-headline uppercase tracking-wider">Grit & Co.</a>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-sm uppercase tracking-widest hover:text-primary transition-colors">Home</a>
              <a href="#" className="text-sm uppercase tracking-widest hover:text-primary transition-colors">Shop</a>
              <a href="#" className="text-sm uppercase tracking-widest hover:text-primary transition-colors">Gritbox</a>
              <a href="#" className="text-sm uppercase tracking-widest hover:text-primary transition-colors">About</a>
              <a href="#" className="text-sm uppercase tracking-widest hover:text-primary transition-colors">Contact</a>
            </nav>
            <div className="flex items-center space-x-4">
              <a href="#" className="hover:text-primary transition-colors"><User className="h-5 w-5" /></a>
              <a href="#" className="hover:text-primary transition-colors"><ShoppingCart className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="relative h-[70vh] flex items-center justify-center text-center text-white">
          <Image
            src="https://placehold.co/1920x1080.png"
            alt="Man working in a workshop"
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 z-0 opacity-20"
            data-ai-hint="dark workshop"
          />
          <div className="relative z-10 p-4">
            <h1 className="text-5xl md:text-7xl font-headline uppercase">
              Built for the <span className="text-primary">Rugged</span> Man
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Premium handcrafted body soap engineered for men who work hard and live harder. Made with nature’s most powerful ingredients.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/80 text-primary-foreground uppercase tracking-widest">Shop Collection</Button>
              <Button size="lg" variant="outline" className="uppercase tracking-widest">New Scents</Button>
            </div>
          </div>
        </section>
        
        <section className="bg-background py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="border border-primary/50 p-4 inline-block mb-4">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-headline text-lg uppercase">Handcrafted</h3>
                <p className="text-sm text-muted-foreground mt-2">Small batch, premium soap with natural ingredients from California forests.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="border border-primary/50 p-4 inline-block mb-4">
                  <Leaf className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-headline text-lg uppercase">Natural Ingredients</h3>
                <p className="text-sm text-muted-foreground mt-2">We use honest, powerful natural ingredients that actually work.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="border border-primary/50 p-4 inline-block mb-4">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-headline text-lg uppercase">Free Shipping</h3>
                <p className="text-sm text-muted-foreground mt-2">On all orders over $50, we'll deliver your order for free.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="border border-primary/50 p-4 inline-block mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-headline text-lg uppercase">Made in California</h3>
                <p className="text-sm text-muted-foreground mt-2">Proudly created in California using locally sourced ingredients and workers.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-card py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-headline uppercase">Featured <span className="text-primary">Collection</span></h2>
            <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
              Discover our most popular handcrafted soaps, each designed for the modern man who demands quality.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12 text-left">
              {[
                { name: 'Scrubby Grit', description: 'Coffee & ground oats for a rugged, energizing morning scrub.', price: '8.00', image: 'https://placehold.co/400x400.png', hint: 'coffee soap' },
                { name: 'Whiskey Oak', description: 'Deep woody notes with an enticing and intoxicating aroma.', price: '9.00', image: 'https://placehold.co/400x400.png', hint: 'whiskey soap' },
                { name: 'Arctic Steel', description: 'Mint and tea tree oils for a sharp, clean feeling all day long.', price: '8.00', image: 'https://placehold.co/400x400.png', hint: 'mint soap' },
                { name: 'Timber & Smoke', description: 'Earthy birch tar and charcoal for a smoky, masculine scent.', price: '9.00', image: 'https://placehold.co/400x400.png', hint: 'charcoal soap' }
              ].map((product) => (
                <div key={product.name} className="bg-background border border-border/50 flex flex-col">
                  <Image src={product.image} alt={product.name} width={400} height={400} className="w-full h-auto object-cover" data-ai-hint={product.hint} />
                  <div className="p-4 flex flex-col flex-grow">
                    <h4 className="font-headline text-xl uppercase">{product.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1 flex-grow">{product.description}</p>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-lg font-headline text-primary">${product.price}</p>
                      <Button variant="outline" size="sm" className="text-xs uppercase tracking-widest">Add To Cart</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
             <Button variant="outline" size="lg" className="mt-12 uppercase tracking-widest">View All Products</Button>
          </div>
        </section>

        <section className="py-20 bg-background">
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
                  <Button size="lg" className="bg-primary hover:bg-primary/80 uppercase tracking-widest">Start my Gritbox - $20/month</Button>
                  <Button size="lg" variant="outline" className="uppercase tracking-widest">Learn More</Button>
                </div>
              </div>
              <div>
                <Image src="https://placehold.co/600x600.png" alt="Gritbox subscription box" width={600} height={600} className="border border-border/50" data-ai-hint="subscription box" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-card">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-headline uppercase">What Men Are <span className="text-primary">Saying</span></h2>
            <div className="grid md:grid-cols-3 gap-8 mt-12 text-left">
              {[
                { name: 'John M.', title: 'Construction Worker', review: "Finally found a soap that actually works for my tough hands. The Timber & Smoke is my new #1. My wife loves the scent too." },
                { name: 'Marcus K.', title: 'Outdoor Guide', review: "The Gritbox subscription is perfect because I never have to think about running out, and I love trying different scents every month." },
                { name: 'David L.', title: 'Firefighter', review: "Been using the Arctic Steel soap for months. Makes me feel better than coffee. Really is incredible." },
              ].map((testimonial) => (
                <div key={testimonial.name} className="bg-background border border-border/50 p-6">
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-primary fill-current" />)}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.review}"</p>
                  <p className="font-headline text-lg mt-4 uppercase">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t border-border/20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 text-left">
            <div>
              <h4 className="text-2xl font-headline uppercase tracking-wider">Grit & Co.</h4>
              <p className="text-sm text-muted-foreground mt-4">Premium handcrafted bar soap for the modern man. Made with natural ingredients sourced from Californian forests.</p>
              <div className="flex space-x-4 mt-4">
                <a href="#" aria-label="Facebook"><Facebook className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" /></a>
                <a href="#" aria-label="Instagram"><Instagram className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" /></a>
              </div>
            </div>
            <div>
              <h5 className="font-headline uppercase tracking-widest text-primary">Shop</h5>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">All Products</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">The Gritbox Subscription</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-headline uppercase tracking-widest text-primary">Support</h5>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Shipping Info</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Returns</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">FAQ</a></li>
              </ul>
            </div>
             <div>
              <h5 className="font-headline uppercase tracking-widest text-primary">Stay in touch</h5>
              <p className="text-sm text-muted-foreground mt-4">Get exclusive deals and updates delivered to your inbox.</p>
              <form className="flex gap-2 mt-4">
                <Input type="email" placeholder="Enter your email" className="bg-background border-border" />
                <Button type="submit" variant="outline" className="whitespace-nowrap">Sign Up</Button>
              </form>
            </div>
          </div>
          <div className="border-t border-border/50 mt-8 pt-6 text-center text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Grit & Co. All Rights Reserved. <a href="#" className="hover:text-foreground">Privacy Policy</a> | <a href="#" className="hover:text-foreground">Terms of Service</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
