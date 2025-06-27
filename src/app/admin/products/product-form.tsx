
'use client';

import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { upsertProduct } from '../actions';
import type { Product } from '@/lib/types';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive("Price must be positive")
  ),
  imageUrl: z.string().url("Must be a valid URL"),
  stock: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().nonnegative("Stock cannot be negative")
  ),
  gritLevel: z.enum(['None', 'Light', 'Medium', 'Heavy']),
  scentProfile: z.string().min(1, "Scent profile is required"),
  tags: z.string().min(1, "Tags are required (comma-separated)"),
  isFeatured: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Partial<Product> | null;
  onSuccess?: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors }, control } = useForm<ProductFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: product?.id || undefined,
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      imageUrl: product?.imageUrl || 'https://placehold.co/400x400.png',
      stock: product?.stock || 0,
      gritLevel: product?.gritLevel || 'Medium',
      scentProfile: product?.scentProfile || '',
      tags: product?.tags?.join(', ') || '',
      isFeatured: product?.isFeatured || false,
    },
  });

  const onSubmit: SubmitHandler<ProductFormData> = (data) => {
    startTransition(async () => {
      try {
        const result = await upsertProduct(data as Partial<Product>);
        if (result.success) {
          toast({ title: "Success", description: result.message });
          onSuccess?.();
        } else {
            throw new Error("Failed to save product");
        }
      } catch (e) {
        toast({ title: "Error", description: "Could not save product.", variant: "destructive" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <div className="col-span-3">
            <Input id="name" {...register("name")} className="w-full" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <div className="col-span-3">
            <Textarea id="description" {...register("description")} className="w-full" />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
            </div>
        </div>
      
        <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="price" className="text-right">Price</Label>
                <div className="col-span-1">
                    <Input id="price" type="number" step="0.01" {...register("price")} className="w-full" />
                    {errors.price && <p className="text-xs text-destructive mt-1">{errors.price.message}</p>}
                </div>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="stock" className="text-right">Stock</Label>
                <div className="col-span-1">
                    <Input id="stock" type="number" {...register("stock")} className="w-full" />
                    {errors.stock && <p className="text-xs text-destructive mt-1">{errors.stock.message}</p>}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
            <div className="col-span-3">
            <Input id="imageUrl" {...register("imageUrl")} className="w-full" />
            {errors.imageUrl && <p className="text-xs text-destructive mt-1">{errors.imageUrl.message}</p>}
            </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="scentProfile" className="text-right">Scent</Label>
            <div className="col-span-3">
            <Input id="scentProfile" {...register("scentProfile")} className="w-full" placeholder="e.g. Cedarwood & Pine" />
            {errors.scentProfile && <p className="text-xs text-destructive mt-1">{errors.scentProfile.message}</p>}
            </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gritLevel" className="text-right">Grit Level</Label>
            <div className="col-span-3">
                <Controller
                    name="gritLevel"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select grit level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="None">None</SelectItem>
                                <SelectItem value="Light">Light</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Heavy">Heavy</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
            {errors.gritLevel && <p className="text-xs text-destructive mt-1">{errors.gritLevel.message}</p>}
            </div>
        </div>

       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="tags" className="text-right">Tags</Label>
        <div className="col-span-3">
          <Input id="tags" {...register("tags")} className="w-full" placeholder="cedar, pine, medium grit"/>
          {errors.tags && <p className="text-xs text-destructive mt-1">{errors.tags.message}</p>}
        </div>
      </div>
      
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="isFeatured" className="text-right">Featured</Label>
        <div className="col-span-3 flex items-center">
            <Controller
                name="isFeatured"
                control={control}
                render={({ field }) => (
                    <Switch
                        id="isFeatured"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                )}
            />
          {errors.isFeatured && <p className="text-xs text-destructive mt-1">{errors.isFeatured.message}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
        </Button>
      </div>
    </form>
  );
}
