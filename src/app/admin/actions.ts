'use server';

import { db } from '@/lib/firebase';
import { Product, Order, UserProfile } from '@/lib/types';
import { collection, collectionGroup, getDocs, doc, updateDoc, addDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// Orders
export async function getAllOrders(): Promise<(Order & { user: { id: string, name: string, email: string } })[]> {
    if (!db) throw new Error("DB connection failed");
    
    const ordersSnapshot = await getDocs(collectionGroup(db, 'orders'));
    const userIds = new Set(ordersSnapshot.docs.map(d => d.ref.parent.parent!.id));
    
    const users: Record<string, {name: string, email: string}> = {};
    if (userIds.size > 0) {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        usersSnapshot.forEach(doc => {
            if (userIds.has(doc.id)) {
                users[doc.id] = {
                    name: doc.data().displayName || 'N/A',
                    email: doc.data().email || 'N/A'
                };
            }
        });
    }

    const orders = ordersSnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        const userId = docSnapshot.ref.parent.parent!.id;
        return {
            id: docSnapshot.id,
            userId,
            date: (data.createdAt?.toDate() ?? new Date()).toISOString(),
            status: data.status,
            total: data.total,
            items: data.items,
            user: {
                id: userId,
                name: users[userId]?.name || 'Unknown User',
                email: users[userId]?.email || 'Unknown Email',
            }
        } as Order & { user: { id: string, name: string, email: string } };
    });

    return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function updateOrderStatus({ userId, orderId, status }: { userId: string, orderId: string, status: Order['status'] }) {
    if (!db) throw new Error("DB connection failed");
    const orderRef = doc(db, `users/${userId}/orders`, orderId);
    await updateDoc(orderRef, { status });
    revalidatePath('/admin/orders');
    return { success: true, message: `Order ${orderId} updated to ${status}` };
}


// Products
export async function getAllProducts(): Promise<Product[]> {
    if (!db) throw new Error("DB connection failed");
    const productsSnapshot = await getDocs(collection(db, 'products'));
    return productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function upsertProduct(product: Partial<Product>) {
    if (!db) throw new Error("DB connection failed");
    const productData = { ...product };
    // Ensure numeric price and boolean featured
    productData.price = Number(productData.price) || 0;
    productData.featured = !!productData.featured;

    if (product.id) {
        const productRef = doc(db, 'products', product.id);
        await setDoc(productRef, productData, { merge: true });
        revalidatePath('/admin/products');
        revalidatePath('/products');
        revalidatePath('/');
        return { success: true, message: `Product ${product.id} updated.` };
    } else {
        const newDocRef = await addDoc(collection(db, 'products'), productData);
        revalidatePath('/admin/products');
        revalidatePath('/products');
        revalidatePath('/');
        return { success: true, message: `Product ${newDocRef.id} created.` };
    }
}

export async function deleteProduct(productId: string) {
    if (!db) throw new Error("DB connection failed");
    await deleteDoc(doc(db, 'products', productId));
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true, message: `Product ${productId} deleted.` };
}

// Users
export async function getAllUsers(): Promise<UserProfile[]> {
    if (!db) throw new Error("DB connection failed");
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            uid: doc.id,
            displayName: data.displayName || '',
            email: data.email || '',
            photoURL: data.photoURL || '',
            role: data.role || 'user',
            createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        };
    });
}

export async function updateUserRole({ userId, role }: { userId: string, role: string }) {
    if (!db) throw new Error("DB connection failed");
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role });
    revalidatePath('/admin/users');
    return { success: true, message: `User ${userId} role updated to ${role}.` };
}