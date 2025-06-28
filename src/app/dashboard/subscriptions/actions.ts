'use server';

import { db } from '@/lib/firebase';
import type { Subscription } from '@/lib/types';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function updateSubscriptionStatus({ userId, active }: { userId: string; active: boolean }) {
    if (!db) throw new Error("DB connection failed");
    const subRef = doc(db, 'subscriptions', userId);
    await updateDoc(subRef, { active });
    revalidatePath('/dashboard/subscriptions');
    return { success: true, message: `Subscription status updated.` };
}

export async function updateSubscriptionFrequency({ userId, frequency }: { userId: string; frequency: Subscription['frequency'] }) {
    if (!db) throw new Error("DB connection failed");
    const subRef = doc(db, 'subscriptions', userId);
    await updateDoc(subRef, { frequency });
    revalidatePath('/dashboard/subscriptions');
    return { success: true, message: `Subscription frequency updated to ${frequency}.` };
}

export async function cancelSubscription({ userId }: { userId: string }) {
    if (!db) throw new Error("DB connection failed");
    const subRef = doc(db, 'subscriptions', userId);
    await deleteDoc(subRef);
    revalidatePath('/dashboard/subscriptions');
    return { success: true, message: 'Your subscription has been cancelled.' };
}
