'use client';
import { useEffect, useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { type Product } from "@/lib/types";
import { getAllProducts } from '../actions';
import { Loader2, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { ProductActions } from './product-actions';
import { ProductForm } from './product-form';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const fetchedProducts = await getAllProducts();
            setProducts(fetchedProducts);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAddProduct = () => {
        setEditingProduct(null);
        setIsDialogOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsDialogOpen(true);
    }
    
    const onFormSuccess = () => {
        setIsDialogOpen(false);
        fetchProducts();
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Card className="bg-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline uppercase text-2xl">Manage Products</CardTitle>
                        <CardDescription>Add, edit, or remove products from your catalog.</CardDescription>
                    </div>
                    <Button onClick={handleAddProduct}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-60">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No products found. Add one to get started.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Featured</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint={product.tags?.join(' ')} />
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>${product.price.toFixed(2)}</TableCell>
                                        <TableCell>{product.stock}</TableCell>
                                        <TableCell>
                                            {product.isFeatured && <Badge>Yes</Badge>}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <ProductActions product={product} onEdit={handleEditProduct} onDeleted={fetchProducts} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                <DialogTitle className="font-headline uppercase">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                <DialogDescription>
                    Fill in the details for the product below. Click save when you are done.
                </DialogDescription>
                </DialogHeader>
                <ProductForm
                    product={editingProduct}
                    onSuccess={onFormSuccess}
                />
            </DialogContent>
        </Dialog>
    );
}
