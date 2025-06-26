'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/lib/types";

type ProfileFormData = Omit<UserProfile, 'uid' | 'role' | 'createdAt' | 'email' | 'photoURL'>;

export default function ProfilePage() {
    const { user, userProfile, loading } = useAuth();
    const { toast } = useToast();
    
    const { register, handleSubmit, reset, formState: { isDirty, isSubmitting } } = useForm<ProfileFormData>({
        defaultValues: {
            displayName: userProfile?.displayName || '',
            phone: userProfile?.phone || '',
            address: {
                line1: userProfile?.address?.line1 || '',
                line2: userProfile?.address?.line2 || '',
                city: userProfile?.address?.city || '',
                state: userProfile?.address?.state || '',
                zip: userProfile?.address?.zip || '',
                country: userProfile?.address?.country || '',
            }
        }
    });

    const onSubmit = async (data: ProfileFormData) => {
        if (!user || !db) return;
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, data);
            toast({
                title: "Profile Updated",
                description: "Your information has been saved.",
            });
            reset(data); // Resets the form's dirty state
        } catch (error) {
            console.error("Error updating profile: ", error);
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <Card className="bg-card border-border/50">
                <CardHeader>
                  <CardTitle className="font-headline uppercase text-2xl">Profile Information</CardTitle>
                  <CardDescription>Update your personal details here.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }


    return (
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="font-headline uppercase text-2xl">Profile Information</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Full Name</Label>
                        <Input id="displayName" {...register("displayName")} className="bg-background" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue={user?.email || ''} className="bg-background" readOnly />
                    </div>
                  </div>
                   <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" {...register("phone")} className="bg-background" />
                    </div>
                  <div className="space-y-2">
                    <Label htmlFor="address.line1">Address</Label>
                    <Input id="address.line1" placeholder="123 Grit St." {...register("address.line1")} className="bg-background" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address.city">City</Label>
                      <Input id="address.city" placeholder="San Francisco" {...register("address.city")} className="bg-background" />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="address.state">State / Province</Label>
                      <Input id="address.state" placeholder="CA" {...register("address.state")} className="bg-background" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address.zip">ZIP / Postal Code</Label>
                      <Input id="address.zip" placeholder="94103" {...register("address.zip")} className="bg-background" />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="address.country">Country</Label>
                      <Input id="address.country" placeholder="USA" {...register("address.country")} className="bg-background" />
                    </div>
                  </div>
                </div>
                <Button type="submit" size="lg" className="uppercase tracking-widest" disabled={isSubmitting || !isDirty}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </form>
        </CardContent>
      </Card>
    );
}
