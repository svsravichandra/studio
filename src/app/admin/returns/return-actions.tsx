
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
import { MoreHorizontal, CheckCircle, XCircle, PackageCheck, Undo2 } from "lucide-react";
import { type ReturnRequest } from "@/lib/types";
import { updateReturnStatus } from "@/app/admin/actions";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";

export function ReturnActions({ request, onUpdate }: { request: ReturnRequest, onUpdate: () => void }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: ReturnRequest['status']) => {
    startTransition(async () => {
      try {
        const result = await updateReturnStatus({ returnId: request.id, status });
        if (result.success) {
          toast({ title: "Success", description: result.message });
          onUpdate();
        } else {
           throw new Error("Failed to update status");
        }
      } catch (error) {
        toast({ title: "Error", description: "Could not update return status.", variant: "destructive" });
      }
    });
  };

  const renderActions = () => {
    switch (request.status) {
        case 'pending':
            return (
                <>
                    <DropdownMenuItem onClick={() => handleStatusChange('approved')}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve Request
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleStatusChange('rejected')}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject Request
                    </DropdownMenuItem>
                </>
            );
        case 'approved':
            return (
                <>
                    <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                        <PackageCheck className="mr-2 h-4 w-4" />
                        Mark as Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
                        <Undo2 className="mr-2 h-4 w-4" />
                        Revert to Pending
                    </DropdownMenuItem>
                </>
            );
        default:
            return <DropdownMenuItem disabled>No actions available</DropdownMenuItem>;
    }
  }

  if (request.status === 'completed' || request.status === 'rejected') {
    return <span className="text-xs text-muted-foreground capitalize">{request.status}</span>;
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
        {renderActions()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
