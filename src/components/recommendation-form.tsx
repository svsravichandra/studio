'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Sparkles, ShoppingCart } from 'lucide-react';
import { getRecommendationsAction } from '@/app/actions';
import type { Product } from '@/lib/types';
import { useCart } from '@/context/cart-context';

const formSchema = z.object({
  preferences: z.string().min(10, {
    message: "Please tell us a bit more about what you're looking for.",
  }).describe("The user's stated preferences for soap and grooming products."),
});

type FormData = z.infer<typeof formSchema>;

export function RecommendationForm() {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCart();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferences: '',
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setRecommendations([]);
    setError(null);

    const result = await getRecommendationsAction(data);

    if ('recommendations' in result) {
      setRecommendations(result.recommendations);
    } else if ('error' in result) {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="bg-background border-primary/20 shadow-lg rounded-lg">
      <CardContent className="p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="preferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary font-headline text-lg">What are you looking for in a soap?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'Something for dry skin, maybe with a fresh, clean scent like pine or mint. I prefer all-natural ingredients.'"
                      className="resize-none h-32 bg-card border-primary/30 focus:border-accent focus:ring-accent"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 shadow-md transition-transform hover:scale-105">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Crafting Recommendations...
                </>
              ) : (
                <>
                   <Sparkles className="mr-2 h-5 w-5" />
                   Get AI Recommendations
                </>
              )}
            </Button>
          </form>
        </Form>
        
        {isLoading && (
            <div className="mt-6 text-center text-muted-foreground animate-pulse">
                <p>Our AI is foraging for the perfect recommendations...</p>
            </div>
        )}

        {error && (
            <div className="mt-6 text-center text-destructive-foreground bg-destructive/80 p-3 rounded-md">
                <p>{error}</p>
            </div>
        )}

        {recommendations.length > 0 && !isLoading && (
          <div className="mt-8 pt-6 border-t border-primary/20">
            <h4 className="text-2xl font-headline text-primary text-center mb-4">Our AI Recommends...</h4>
            <div className="grid md:grid-cols-3 gap-6">
              {recommendations.map((product) => (
                <div key={product.id} className="bg-background border border-border/50 rounded-lg flex flex-col overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow duration-300 text-left">
                  <Image src={product.image} alt={product.name} width={400} height={400} className="w-full h-auto object-cover" data-ai-hint={product.hint} />
                  <div className="p-4 flex flex-col flex-grow">
                    <h5 className="font-headline text-xl uppercase">{product.name}</h5>
                    <p className="text-sm text-muted-foreground mt-1 flex-grow">{product.description}</p>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-lg font-headline text-primary">${product.price.toFixed(2)}</p>
                      <Button variant="outline" size="sm" className="text-xs uppercase tracking-widest" onClick={() => addToCart(product)}>
                        <ShoppingCart className="mr-2 h-4 w-4"/>
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
