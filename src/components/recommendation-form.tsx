'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Sparkles, Leaf } from 'lucide-react';
import { getRecommendationsAction } from '@/app/actions';

const formSchema = z.object({
  browsingHistory: z.string().min(10, {
    message: "Please tell us a bit more about what you've liked.",
  }).describe("The user's browsing history, as a string."),
  statedPreferences: z.string().min(10, {
    message: "Please tell us a bit more about your preferences.",
  }).describe("The user's stated preferences, as a string."),
});

type FormData = z.infer<typeof formSchema>;

export function RecommendationForm() {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      browsingHistory: '',
      statedPreferences: '',
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
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="browsingHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary font-headline text-lg">What scents or products have you liked?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'I usually go for woody scents like sandalwood. I've tried some charcoal soaps before.'"
                        className="resize-none h-32 bg-card border-primary/30 focus:border-accent focus:ring-accent"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="statedPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary font-headline text-lg">What are you looking for in a product?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'Something for dry skin, maybe with a fresh, clean scent. I prefer all-natural ingredients.'"
                        className="resize-none h-32 bg-card border-primary/30 focus:border-accent focus:ring-accent"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
            <ul className="grid grid-cols-1 gap-3 list-none p-0">
              {recommendations.map((rec, index) => (
                <li key={index} className="bg-background border border-primary/20 rounded-lg p-4 flex items-center gap-4 transition-all hover:border-accent hover:shadow-md">
                   <Leaf className="h-5 w-5 text-accent flex-shrink-0" />
                  <p className="text-primary font-medium">{rec}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
