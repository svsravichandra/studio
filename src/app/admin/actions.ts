
'use server';

import { db } from '@/lib/firebase';
import { Product, Order, UserProfile, Address, ReturnRequest } from '@/lib/types';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, setDoc, query, where, documentId, orderBy } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { mapOrder, mapProduct, mapReturnRequest, mapUser } from '@/lib/mappers';

// Orders
export async function getAllOrders(): Promise<(Order & { user: { id: string, name: string, email: string } })[]> {
    if (!db) throw new Error("DB connection failed");
    
    // 1. Fetch all orders from the root collection
    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'));
    const ordersSnapshot = await getDocs(ordersQuery);

    if (ordersSnapshot.empty) {
        return [];
    }

    const mappedOrders = ordersSnapshot.docs.map(mapOrder);
    
    // 2. Collect all unique user IDs from the orders
    const userIds = [...new Set(mappedOrders.map(o => o.userId))];
    
    // 3. Fetch user data for these user IDs in batches
    const users: Record<string, {name: string, email: string}> = {};
    if (userIds.length > 0) {
        const usersRef = collection(db, 'users');
        const promises = [];
        for (let i = 0; i < userIds.length; i += 30) {
            const chunk = userIds.slice(i, i + 30);
            const q = query(usersRef, where(documentId(), 'in', chunk));
            promises.push(getDocs(q));
        }

        const userSnapshots = await Promise.all(promises);
        userSnapshots.forEach(snapshot => {
            snapshot.forEach(doc => {
                const user = mapUser(doc);
                users[doc.id] = {
                    name: user.name || 'N/A',
                    email: user.email || 'N/A'
                };
            });
        });
    }

    // 4. Combine order data with user data
    const ordersData = mappedOrders.map(order => {
        const userId = order.userId;
        return {
            ...order,
            user: {
                id: userId,
                name: users[userId]?.name || 'Unknown User',
                email: users[userId]?.email || 'Unknown Email',
            }
        };
    });

    return JSON.parse(JSON.stringify(ordersData));
}


export async function updateOrderStatus({ orderId, status }: { orderId: string, status: Order['status'] }) {
    if (!db) throw new Error("DB connection failed");
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
    revalidatePath('/admin/orders');
    return { success: true, message: `Order ${orderId} updated to ${status}` };
}

export async function updateOrderShipmentDetails({ orderId, trackingNumber, carrier }: { orderId: string, trackingNumber: string, carrier: string }) {
    if (!db) throw new Error("DB connection failed");
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { trackingNumber, carrier });
    revalidatePath('/admin/orders');
    return { success: true, message: `Shipment details for order ${orderId} updated.` };
}


// Products
export async function getAllProducts(): Promise<Product[]> {
    if (!db) throw new Error("DB connection failed");
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const products = productsSnapshot.docs.map(mapProduct);
    return JSON.parse(JSON.stringify(products));
}

export async function upsertProduct(product: Partial<Product>) {
    if (!db) throw new Error("DB connection failed");
    
    const productData: any = { ...product };

    // Tags come from the form as a comma-separated string
    if (typeof productData.tags === 'string') {
        productData.tags = (productData.tags as string).split(',').map(tag => tag.trim()).filter(Boolean);
    } else if (!Array.isArray(productData.tags)) {
        productData.tags = [];
    }

    // Destructure to remove id from the data being saved to the document
    const { id, ...dataToSave } = productData;

    if (id) {
        const productRef = doc(db, 'products', id);
        await setDoc(productRef, dataToSave, { merge: true });
        revalidatePath('/admin/products');
        revalidatePath('/products');
        revalidatePath('/');
        return { success: true, message: `Product ${id} updated.` };
    } else {
        const newDocRef = await addDoc(collection(db, 'products'), dataToSave);
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
    const users = usersSnapshot.docs.map(mapUser);
    return JSON.parse(JSON.stringify(users));
}

export async function updateUserRole({ userId, role }: { userId: string, role: string }) {
    if (!db) throw new Error("DB connection failed");
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role });
    revalidatePath('/admin/users');
    return { success: true, message: `User ${userId} role updated to ${role}.` };
}

// Return Requests
export async function getAllReturnRequests(): Promise<ReturnRequest[]> {
    if (!db) throw new Error("DB connection failed");
    const returnsRef = collection(db, 'returns');
    const returnsQuery = query(returnsRef, orderBy('requestedAt', 'desc'));
    const returnsSnapshot = await getDocs(returnsQuery);

    if (returnsSnapshot.empty) {
        return [];
    }

    const returnsData = returnsSnapshot.docs.map(mapReturnRequest);
    return JSON.parse(JSON.stringify(returnsData));
}

export async function updateReturnStatus({ returnId, status }: { returnId: string, status: ReturnRequest['status'] }) {
    if (!db) throw new Error("DB connection failed");
    const returnRef = doc(db, 'returns', returnId);
    await updateDoc(returnRef, { status });

    // Also update the corresponding order's status
    const orderRef = doc(db, 'orders', returnId); // returnId is the same as orderId
    let orderStatus: Order['status'] | null = null;
    switch (status) {
        case 'approved':
            orderStatus = 'return started';
            break;
        case 'completed':
            orderStatus = 'return completed';
            break;
        case 'refunded':
            orderStatus = 'refunded';
            break;
        // Not handling 'rejected' or 'pending' to avoid complexity,
        // as the original state isn't tracked.
    }

    if (orderStatus) {
        await updateDoc(orderRef, { status: orderStatus });
        revalidatePath('/admin/orders');
    }

    revalidatePath('/admin/returns');
    return { success: true, message: `Return request ${returnId} updated to ${status}` };
}
