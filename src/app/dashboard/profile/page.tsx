'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

type ProfileFormData = {
    displayName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export default function ProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { isDirty } } = useForm<ProfileFormData>();

    useEffect(() => {
        const fetchProfile = async () => {
            if (user && db) {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    reset({
                        displayName: data.displayName || user.displayName || '',
                        address: data.address || '',
                        city: data.city || '',
                        state: data.state || '',
                        zip: data.zip || '',
                        country: data.country || '',
                    });
                }
            }
        };
        fetchProfile();
    }, [user, reset]);

    const onSubmit = async (data: ProfileFormData) => {
        if (!user || !db) return;
        setIsLoading(true);
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, data);
            toast({
                title: "Profile Updated",
                description: "Your information has been saved.",
            });
        } catch (error) {
            console.error("Error updating profile: ", error);
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

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
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="123 Grit St." {...register("address")} className="bg-background" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="San Francisco" {...register("city")} className="bg-background" />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="state">State / Province</Label>
                      <Input id="state" placeholder="CA" {...register("state")} className="bg-background" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP / Postal Code</Label>
                      <Input id="zip" placeholder="94103" {...register("zip")} className="bg-background" />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" placeholder="USA" {...register("country")} className="bg-background" />
                    </div>
                  </div>
                </div>
                <Button type="submit" size="lg" className="uppercase tracking-widest" disabled={isLoading || !isDirty}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </form>
        </CardContent>
      </Card>
    );
}
