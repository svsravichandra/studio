
'use server';

import { db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, serverTimestamp, query, where, updateDoc } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function createReturnRequest(order: Order, userName: string, userEmail: string) {
    if (!db) throw new Error("DB connection failed");

    const returnRef = doc(db, 'returns', order.id);

    const newReturnRequest = {
        orderId: order.id,
        userId: order.userId,
        status: 'pending',
        requestedAt: serverTimestamp(),
        orderTotal: order.total,
        orderDate: order.createdAt,
        userName: userName,
        userEmail: userEmail,
    };

    await setDoc(returnRef, newReturnRequest);
    
    // Also update the corresponding order's status to 'return started'
    const orderRef = doc(db, 'orders', order.id);
    await updateDoc(orderRef, { status: 'return started' });


    revalidatePath('/admin/returns');
    revalidatePath('/dashboard/orders');
    revalidatePath('/admin/orders'); // Revalidate admin orders page as well

    return { success: true, message: `Return request for order #${order.id} has been submitted.` };
}

export async function getReturnRequestIdsForUser(userId: string): Promise<string[]> {
    if (!db) return [];
    try {
        const returnsRef = collection(db, 'returns');
        const q = query(returnsRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.id);
    } catch (error) {
        console.error("Error fetching user return requests:", error);
        return [];
    }
}
