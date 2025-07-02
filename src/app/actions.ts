'use server';

import {
  getPersonalizedRecommendations,
  PersonalizedRecommendationsInput,
} from '@/ai/flows/product-recommendation';
import type { Product } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, query, where, documentId, getDocs } from 'firebase/firestore';
import { mapProduct } from '@/lib/mappers';

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

export async function getProductsByIdsAction(productIds: string[]): Promise<Product[]> {
    if (!db || productIds.length === 0) return [];
    
    try {
        const productsRef = collection(db, 'products');
        const products: Product[] = [];
        
        // Firestore 'in' queries are limited to 30 elements, so we batch them.
        const promises = [];
        for (let i = 0; i < productIds.length; i += 30) {
            const chunk = productIds.slice(i, i + 30);
            const q = query(productsRef, where(documentId(), 'in', chunk));
            promises.push(getDocs(q));
        }

        const productSnapshots = await Promise.all(promises);
        productSnapshots.forEach(snapshot => {
            snapshot.forEach(doc => {
                products.push(mapProduct(doc));
            });
        });
        
        return JSON.parse(JSON.stringify(products));

    } catch (error) {
        console.error("Error fetching products by IDs:", error);
        return [];
    }
}
