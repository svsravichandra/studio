import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/lib/types";
import { ProductList } from "./product-list";

async function getProducts(): Promise<{ products: Product[] } | { error: string }> {
  if (!db) {
    return { error: "Database connection failed. Please ensure your Firebase environment variables are set correctly in the .env file." };
  }
  try {
    const productsRef = collection(db, "products");
    const querySnapshot = await getDocs(productsRef);
    
    if (querySnapshot.empty) {
      return { products: [] };
    }

    const productsData: Product[] = [];
    querySnapshot.forEach((doc) => {
      productsData.push({ id: doc.id, ...doc.data() } as Product);
    });
    return { products: productsData };
  } catch (error: any) {
    console.error("Error fetching products: ", error);
    return { error: `Failed to fetch products from the database. Please check Firestore security rules and configuration. Details: ${error.message}` };
  }
}

export default async function ProductsPage() {
  const result = await getProducts();

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-headline uppercase">Our <span className="text-primary">Collection</span></h1>
          <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
            Explore our full range of handcrafted soaps, engineered for excellence.
          </p>
        </div>
        {'error' in result ? (
          <div className="text-center py-16 text-destructive-foreground bg-destructive/20 p-6 rounded-lg">
            <h3 className="text-2xl font-headline uppercase mb-2">Error Loading Products</h3>
            <p>{result.error}</p>
          </div>
        ) : result.products.length > 0 ? (
           <ProductList products={result.products} />
        ) : (
          <div className="text-center py-16 text-muted-foreground">
              <p>No products found in the database.</p>
              <p className="text-sm mt-2">Please add products to the 'products' collection in your Firestore database.</p>
          </div>
        )}
      </div>
    </div>
  );
}
