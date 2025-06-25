'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
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

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive("Price must be positive")
  ),
  image: z.string().url("Must be a valid URL"),
  hint: z.string().min(1, "AI Hint is required"),
  featured: z.boolean().default(false),
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
      image: product?.image || 'https://placehold.co/400x400.png',
      hint: product?.hint || '',
      featured: product?.featured || false,
    },
  });

  const onSubmit: SubmitHandler<ProductFormData> = (data) => {
    startTransition(async () => {
      try {
        const result = await upsertProduct(data);
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
      
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="price" className="text-right">Price</Label>
        <div className="col-span-3">
          <Input id="price" type="number" step="0.01" {...register("price")} className="w-full" />
           {errors.price && <p className="text-xs text-destructive mt-1">{errors.price.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="image" className="text-right">Image URL</Label>
        <div className="col-span-3">
          <Input id="image" {...register("image")} className="w-full" />
          {errors.image && <p className="text-xs text-destructive mt-1">{errors.image.message}</p>}
        </div>
      </div>

       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="hint" className="text-right">AI Hint</Label>
        <div className="col-span-3">
          <Input id="hint" {...register("hint")} className="w-full" placeholder="e.g. coffee soap"/>
          {errors.hint && <p className="text-xs text-destructive mt-1">{errors.hint.message}</p>}
        </div>
      </div>
      
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="featured" className="text-right">Featured</Label>
        <div className="col-span-3 flex items-center">
            <Controller
                name="featured"
                control={control}
                render={({ field }) => (
                    <Switch
                        id="featured"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                )}
            />
          {errors.featured && <p className="text-xs text-destructive mt-1">{errors.featured.message}</p>}
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