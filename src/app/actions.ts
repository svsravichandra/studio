'use server';

import {
  getPersonalizedRecommendations,
  PersonalizedRecommendationsInput,
} from '@/ai/flows/product-recommendation';
import type { Product } from '@/lib/types';

export async function getRecommendationsAction(
  input: PersonalizedRecommendationsInput
): Promise<{ recommendations: Product[] } | { error: string }> {
  try {
    // Simulate network latency to make loading state more apparent
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const result = await getPersonalizedRecommendations(input);
    return { recommendations: result.recommendations };
  } catch (error) {
    console.error('AI recommendation error:', error);
    return {
      error:
        "Sorry, we couldn't get recommendations at this time. Please try again later.",
    };
  }
}
