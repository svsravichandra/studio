import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/lib/types";
import { ProductList } from "./product-list";

async function getProducts(): Promise<Product[]> {
  if (!db) {
    console.error("Firestore is not initialized.");
    return [];
  }
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const productsData: Product[] = [];
    querySnapshot.forEach((doc) => {
      productsData.push({ id: doc.id, ...doc.data() } as Product);
    });
    return productsData;
  } catch (error) {
    console.error("Error fetching products: ", error);
    // In a real app, you might want to log this error to a service
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-headline uppercase">Our <span className="text-primary">Collection</span></h1>
          <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
            Explore our full range of handcrafted soaps, engineered for excellence.
          </p>
        </div>
        <ProductList products={products} />
      </div>
    </div>
  );
}
