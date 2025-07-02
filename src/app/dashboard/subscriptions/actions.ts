
'use server';

import { db } from '@/lib/firebase';
import type { Subscription, SubscriptionProduct } from '@/lib/types';
import { doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function createSubscription({ userId, items, frequency, paymentMethodId }: { userId: string; items: SubscriptionProduct[]; frequency: Subscription['frequency'], paymentMethodId: string }) {
    if (!db) throw new Error("DB connection failed");

    const nextDeliveryDate = new Date();
    nextDeliveryDate.setMonth(nextDeliveryDate.getMonth() + 1);

    const newSubscriptionData = {
        userId: userId,
        active: true,
        frequency: frequency,
        nextDelivery: nextDeliveryDate.toISOString(),
        items: items,
        createdAt: serverTimestamp(),
        paymentMethodId: paymentMethodId,
    };

    const subRef = doc(db, 'subscriptions', userId);
    await setDoc(subRef, newSubscriptionData);
    revalidatePath('/dashboard/subscriptions');
    return { success: true, message: 'Your Gritbox subscription has been started!' };
}


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

export async function updateSubscriptionItems({ userId, items }: { userId: string; items: SubscriptionProduct[] }) {
    if (!db) throw new Error("DB connection failed");
    const subRef = doc(db, 'subscriptions', userId);
    // Ensure we are only writing plain objects to Firestore.
    const itemsToStore = items.map(item => ({ productId: item.productId, quantity: item.quantity }));
    await updateDoc(subRef, { items: itemsToStore });
    revalidatePath('/dashboard/subscriptions');
    return { success: true, message: `Subscription items updated.` };
}

export async function cancelSubscription({ userId }: { userId: string }) {
    if (!db) throw new Error("DB connection failed");
    const subRef = doc(db, 'subscriptions', userId);
    await deleteDoc(subRef);
    revalidatePath('/dashboard/subscriptions');
    return { success: true, message: 'Your subscription has been cancelled.' };
}
