
'use client';
import { useEffect, useState, useTransition, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { type ReturnRequest } from "@/lib/types";
import { getAllReturnRequests } from '../actions';
import { Loader2 } from 'lucide-react';
import { ReturnActions } from './return-actions';
import { Button } from '@/components/ui/button';

export default function AdminReturnsPage() {
    const [requests, setRequests] = useState<ReturnRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [, startTransition] = useTransition();

    const fetchRequests = useCallback(() => {
        startTransition(async () => {
            setIsLoading(true);
            try {
                const fetchedRequests = await getAllReturnRequests();
                setRequests(fetchedRequests ? JSON.parse(JSON.stringify(fetchedRequests)) : []);
            } catch (error) {
                console.error("Failed to fetch return requests:", error);
            } finally {
                setIsLoading(false);
            }
        });
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const getStatusVariant = (status: ReturnRequest['status']) => {
        switch (status) {
            case 'approved': return 'default';
            case 'completed': return 'secondary';
            case 'pending': return 'outline';
            case 'rejected': return 'destructive';
            default: return 'outline';
        }
    };
    
    return (
        <Card className="bg-card border-border/50">
            <CardHeader>
                <CardTitle className="font-headline uppercase text-2xl">Manage Returns</CardTitle>
                <CardDescription>View and process customer return requests.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                     <div className="flex justify-center items-center h-60">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : requests.length === 0 ? (
                     <div className="text-center py-12 text-muted-foreground">
                        <p>No return requests found.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Requested On</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Order Total</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell>
                                        <span className="font-medium truncate block" style={{maxWidth: '100px'}}>{request.orderId}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div>{request.userName}</div>
                                        <div className="text-xs text-muted-foreground">{request.userEmail}</div>
                                    </TableCell>
                                    <TableCell>{new Date(request.requestedAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(request.status)} className="capitalize">{request.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">${request.orderTotal.toFixed(2)}</TableCell>
                                    <TableCell className="text-center">
                                        <ReturnActions request={request} onUpdate={fetchRequests} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
