import { Mountain, Axe, Leaf, Instagram, Facebook } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { RecommendationForm } from '@/components/recommendation-form';

export default function Home() {
  return (
    <div className="bg-background text-foreground font-body">
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-headline text-primary">Grizzly & Oak</h1>
        </div>
      </header>

      <main>
        <section className="text-center py-20 sm:py-24 lg:py-32 px-4 bg-card shadow-inner">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-headline text-primary mb-4 animate-fade-in-down">Handcrafted Goodness.</h2>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-muted-foreground animate-fade-in-up">
              Earth-sourced ingredients. Zero BS formulations. For the modern man who cares.
            </p>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg transform hover:scale-105 transition-transform duration-300">Shop The Collection</Button>
          </div>
        </section>

        <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
                <h3 className="text-4xl font-headline text-primary mb-6">Our Mission</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                    At Grizzly & Oak, we believe in transparency and quality. We're dedicated to crafting premium grooming essentials using only the finest natural ingredients. Our products are designed for the discerning man who values tradition, craftsmanship, and a connection to the wild. We're committed to eco-friendly packaging and honest, effective formulas.
                </p>
            </div>
        </section>
        
        <section className="bg-card py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-background p-5 rounded-full mb-4 shadow-md">
                <Axe className="h-10 w-10 text-primary" />
              </div>
              <h4 className="text-2xl font-headline text-primary mb-2">Small Batch Handcrafted</h4>
              <p className="text-muted-foreground">Ensuring the highest quality and attention to detail in every bar of soap.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-background p-5 rounded-full mb-4 shadow-md">
                 <Leaf className="h-10 w-10 text-primary" />
              </div>
              <h4 className="text-2xl font-headline text-primary mb-2">Natural Ingredients</h4>
              <p className="text-muted-foreground">Harnessing the power of nature with earth-sourced oils, butters, and botanicals.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-background p-5 rounded-full mb-4 shadow-md">
                 <Mountain className="h-10 w-10 text-primary" />
              </div>
              <h4 className="text-2xl font-headline text-primary mb-2">Proudly USA-Made</h4>
              <p className="text-muted-foreground">Supporting local artisans and communities with products made right here in the USA.</p>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-headline text-primary text-center mb-12">Our Bestsellers</h3>
          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-lg border-primary/10">
              <CardHeader className="p-0">
                <Image src="https://placehold.co/600x400.png" alt="Pine Tar Grit Soap" width={600} height={400} className="w-full h-auto object-cover" data-ai-hint="pine soap" />
              </CardHeader>
              <CardContent className="p-6 text-center">
                <h4 className="font-headline text-2xl text-primary">Pine Tar Grit Soap</h4>
                <p className="text-muted-foreground mt-2">An exfoliating and rugged scent of a deep forest.</p>
                <Button className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90">Add to Cart</Button>
              </CardContent>
            </Card>
            <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-lg border-primary/10">
              <CardHeader className="p-0">
                <Image src="https://placehold.co/600x400.png" alt="Cedarwood & Clay Soap" width={600} height={400} className="w-full h-auto object-cover" data-ai-hint="cedarwood soap" />
              </CardHeader>
              <CardContent className="p-6 text-center">
                <h4 className="font-headline text-2xl text-primary">Cedarwood & Clay</h4>
                <p className="text-muted-foreground mt-2">A cleansing and earthy bar for a balanced skin feel.</p>
                 <Button className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90">Add to Cart</Button>
              </CardContent>
            </Card>
            <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-lg border-primary/10">
              <CardHeader className="p-0">
                <Image src="https://placehold.co/600x400.png" alt="Bourbon & Oak Beard Oil" width={600} height={400} className="w-full h-auto object-cover" data-ai-hint="beard oil" />
              </CardHeader>
              <CardContent className="p-6 text-center">
                <h4 className="font-headline text-2xl text-primary">Bourbon & Oak Beard Oil</h4>
                <p className="text-muted-foreground mt-2">A conditioning oil with a warm, sophisticated scent.</p>
                 <Button className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90">Add to Cart</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="bg-card py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h3 className="text-4xl font-headline text-primary text-center mb-4">Find Your Perfect Match</h3>
                <p className="text-lg text-muted-foreground text-center mb-8">
                    Not sure where to start? Let our AI guide you to the perfect products based on your preferences.
                </p>
                <RecommendationForm />
            </div>
        </section>

        <footer className="bg-primary text-primary-foreground py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h4 className="font-headline text-2xl mb-4">Grizzly & Oak</h4>
              <p className="text-sm text-primary-foreground/80">Crafted for the wild at heart.</p>
            </div>
            <div>
              <h4 className="font-headline text-xl mb-4">Stay Connected</h4>
              <p className="text-sm text-primary-foreground/80 mb-4">Get exclusive deals and updates delivered to your inbox.</p>
              <form className="flex flex-col sm:flex-row gap-2">
                <Input type="email" placeholder="Enter your email" className="bg-background/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:ring-accent" />
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Subscribe</Button>
              </form>
            </div>
            <div>
              <h4 className="font-headline text-xl mb-4">Follow Us</h4>
              <div className="flex gap-4 justify-center md:justify-start">
                <a href="#" aria-label="Instagram"><Instagram className="h-6 w-6 hover:text-accent transition-colors" /></a>
                <a href="#" aria-label="Facebook"><Facebook className="h-6 w-6 hover:text-accent transition-colors" /></a>
              </div>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm text-primary-foreground/60">
            <p>&copy; {new Date().getFullYear()} Grizzly & Oak. All Rights Reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
