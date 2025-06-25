/**
 * @fileOverview A tool for fetching the product catalog from Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';

export const ProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    image: z.string(),
    hint: z.string(),
    featured: z.boolean().optional(),
});

export const getProductCatalog = ai.defineTool(
  {
    name: 'getProductCatalog',
    description: 'Returns the full catalog of available products.',
    inputSchema: z.void(),
    outputSchema: z.array(ProductSchema),
  },
  async () => {
    if (!db) {
      console.error('DB connection failed');
      return [];
    }
    try {
      const productsRef = collection(db, 'products');
      const querySnapshot = await getDocs(productsRef);
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });
      return products;
    } catch (error) {
      console.error('Error fetching product catalog:', error);
      return [];
    }
  }
);
