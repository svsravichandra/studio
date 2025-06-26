
'use server';

/**
 * @fileOverview Personalized product recommendations flow.
 *
 * - getPersonalizedRecommendations - A function that provides personalized product recommendations based on user preferences.
 * - PersonalizedRecommendationsInput - The input type for the getPersonalizedRecommendations function.
 * - PersonalizedRecommendationsOutput - The return type for the getPersonalizedRecommendations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getProductCatalog, ProductSchema } from '@/ai/tools/product-catalog';

const PersonalizedRecommendationsInputSchema = z.object({
  preferences: z
    .string()
    .describe('The user stated preferences for soap and grooming products.'),
});
export type PersonalizedRecommendationsInput = z.infer<
  typeof PersonalizedRecommendationsInputSchema
>;

const PersonalizedRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(ProductSchema)
    .describe('An array of 3 personalized product recommendations from the catalog.'),
});
export type PersonalizedRecommendationsOutput = z.infer<
  typeof PersonalizedRecommendationsOutputSchema
>;

export async function getPersonalizedRecommendations(
  input: PersonalizedRecommendationsInput
): Promise<PersonalizedRecommendationsOutput> {
  return personalizedProductRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedProductRecommendationPrompt',
  input: { schema: PersonalizedRecommendationsInputSchema },
  output: { schema: PersonalizedRecommendationsOutputSchema },
  tools: [getProductCatalog],
  prompt: `You are an expert personal shopper specializing in recommending soaps and grooming essentials.

  Your task is to provide 3 personalized product recommendations based on the user's stated preferences.

  First, you MUST use the getProductCatalog tool to see the full list of available products.
  Then, from that list, select the 3 best products that match the user's preferences.
  
  Do not recommend any products that are not in the catalog.
  Provide your response as a JSON object containing a 'recommendations' array with the full product objects for your 3 chosen products.

  User Preferences: {{{preferences}}}`,
});

const personalizedProductRecommendationFlow = ai.defineFlow(
  {
    name: 'personalizedProductRecommendationFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
