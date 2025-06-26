'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Shield, ShieldOff } from "lucide-react";
import { type UserProfile } from "@/lib/types";
import { updateUserRole } from "@/app/admin/actions";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { useAuth } from "@/context/auth-context";

export function UserActions({ user }: { user: UserProfile }) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (role: string) => {
    startTransition(async () => {
      try {
        await updateUserRole({ userId: user.uid, role });
        toast({ title: "Success", description: `User role updated to ${role}.` });
      } catch (error) {
        toast({ title: "Error", description: "Could not update user role.", variant: "destructive" });
      }
    });
  };
  
  // Prevent admin from demoting themselves
  if (currentUser?.uid === user.uid) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.role === 'admin' ? (
          <DropdownMenuItem onClick={() => handleRoleChange('customer')}>
            <ShieldOff className="mr-2 h-4 w-4" />
            Demote to Customer
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => handleRoleChange('admin')}>
            <Shield className="mr-2 h-4 w-4" />
            Promote to Admin
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
