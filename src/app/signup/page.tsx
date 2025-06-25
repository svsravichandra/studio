'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" {...props} xmlns="http://www.w3.org/2000/svg">
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.9 2.26-6.11 2.26-4.62 0-8.38-3.77-8.38-8.38s3.76-8.38 8.38-8.38c2.6 0 4.38 1.02 5.37 2.02l2.6-2.6C18.96 1.15 16.14 0 12.48 0 5.6 0 0 5.6 0 12.5S5.6 25 12.48 25c6.9 0 11.45-4.8 11.45-11.72 0-.78-.08-1.55-.2-2.32h-11.25z"
      />
    </svg>
  );

export default function SignUpPage() {
  const { signInWithGoogle, authInitialized } = useAuth();
  
  return (
    <div className="flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-sm bg-card border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline uppercase">Create Account</CardTitle>
          <CardDescription>Get started with Grit & Co.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" placeholder="John Doe" required className="bg-background"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" required className="bg-background"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required className="bg-background"/>
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" required className="bg-background"/>
            </div>
            <Button type="submit" className="w-full uppercase tracking-widest">
              Create Account
            </Button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={signInWithGoogle} disabled={!authInitialized}>
            <GoogleIcon className="mr-2 h-4 w-4" />
            Google
          </Button>
          {!authInitialized && (
            <p className="mt-2 text-xs text-center text-muted-foreground">
              Google Sign-In is currently unavailable.
            </p>
          )}

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline hover:text-primary">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
