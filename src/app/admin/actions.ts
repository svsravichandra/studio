
'use server';

import { db } from '@/lib/firebase';
import { Product, Order, UserProfile, Address } from '@/lib/types';
import { collection, collectionGroup, getDocs, doc, updateDoc, addDoc, deleteDoc, setDoc, Timestamp, query, where, documentId } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// Orders
export async function getAllOrders(): Promise<(Order & { user: { id: string, name: string, email: string } })[]> {
    if (!db) throw new Error("DB connection failed");
    
    const ordersSnapshot = await getDocs(collectionGroup(db, 'orders'));
    const userIds = [...new Set(ordersSnapshot.docs.map(d => d.ref.parent.parent!.id))];
    
    const users: Record<string, {name: string, email: string}> = {};
    if (userIds.length > 0) {
        const usersRef = collection(db, 'users');
        // Firestore 'in' queries are limited to 30 elements, so we batch them.
        const promises = [];
        for (let i = 0; i < userIds.length; i += 30) {
            const chunk = userIds.slice(i, i + 30);
            const q = query(usersRef, where(documentId(), 'in', chunk));
            promises.push(getDocs(q));
        }

        const userSnapshots = await Promise.all(promises);
        userSnapshots.forEach(snapshot => {
            snapshot.forEach(doc => {
                const data = doc.data();
                users[doc.id] = {
                    name: data.name || 'N/A',
                    email: data.email || 'N/A'
                };
            });
        });
    }

    const orders = ordersSnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        const userId = docSnapshot.ref.parent.parent!.id;
        const createdAtTimestamp = data.createdAt as Timestamp;
        return {
            id: docSnapshot.id,
            userId,
            createdAt: createdAtTimestamp ? createdAtTimestamp.toDate().toISOString() : new Date().toISOString(),
            status: data.status,
            total: data.total,
            items: data.items,
            shippingAddress: data.shippingAddress,
            user: {
                id: userId,
                name: users[userId]?.name || 'Unknown User',
                email: users[userId]?.email || 'Unknown Email',
            }
        } as Order & { user: { id: string, name: string, email: string } };
    });

    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
    const productData: any = { ...product };

    // Ensure correct types before sending to Firestore
    productData.price = Number(productData.price) || 0;
    productData.stock = Number(productData.stock) || 0;
    productData.isFeatured = !!productData.isFeatured;
    if (typeof productData.tags === 'string') {
        productData.tags = (productData.tags as string).split(',').map(tag => tag.trim()).filter(Boolean);
    } else if (!Array.isArray(productData.tags)) {
        productData.tags = [];
    }


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
        const createdAtTimestamp = data.createdAt as Timestamp;
        return {
            uid: doc.id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || {},
            role: data.role || 'customer',
            createdAt: createdAtTimestamp ? createdAtTimestamp.toDate().toISOString() : new Date().toISOString(),
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
