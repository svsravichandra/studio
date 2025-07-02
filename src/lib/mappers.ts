import {
  Address,
  Order,
  OrderProduct,
  Product,
  ReturnRequest,
  Subscription,
  SubscriptionProduct,
  UserProfile,
} from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

const toISOString = (timestamp: any): string => {
  if (timestamp && typeof timestamp.toDate === 'function') {
    return (timestamp as Timestamp).toDate().toISOString();
  }
  if (typeof timestamp === 'string') {
      return timestamp;
  }
  return new Date().toISOString();
};

export const mapProduct = (doc: any): Product => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || '',
    description: data.description || '',
    price: data.price || 0,
    gritLevel: data.gritLevel || 'None',
    scentProfile: data.scentProfile || '',
    stock: data.stock || 0,
    isFeatured: data.isFeatured || false,
    imageUrl: data.imageUrl || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
  };
};

export const mapUser = (doc: any): UserProfile => {
  const data = doc.data();
  return {
    uid: doc.id,
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    address: {
      line1: data.address?.line1 || '',
      line2: data.address?.line2 || '',
      city: data.address?.city || '',
      state: data.address?.state || '',
      zip: data.address?.zip || '',
      country: data.address?.country || '',
    },
    role: data.role || 'customer',
    createdAt: toISOString(data.createdAt),
  };
};

export const mapOrder = (doc: any): Order => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId || '',
    items: Array.isArray(data.items)
      ? data.items.map(
          (item: any): OrderProduct => ({
            productId: item.productId || '',
            name: item.name || '',
            imageUrl: item.imageUrl || '',
            quantity: item.quantity || 0,
            price: item.price || 0,
          })
        )
      : [],
    total: data.total || 0,
    status: data.status || 'processing',
    shippingAddress: {
      line1: data.shippingAddress?.line1 || '',
      line2: data.shippingAddress?.line2 || '',
      city: data.shippingAddress?.city || '',
      state: data.shippingAddress?.state || '',
      zip: data.shippingAddress?.zip || '',
      country: data.shippingAddress?.country || '',
    },
    trackingNumber: data.trackingNumber || '',
    carrier: data.carrier || '',
    createdAt: toISOString(data.createdAt),
  };
};

const mapSubscriptionItems = (items: any[]): SubscriptionProduct[] => {
    if (!Array.isArray(items)) return [];
    if (items.length === 0) return [];
  
    // Check if we need to convert from old string[] format
    if (typeof items[0] === 'string') {
      const counts: { [key: string]: number } = {};
      items.forEach(id => {
        counts[id] = (counts[id] || 0) + 1;
      });
      return Object.entries(counts).map(([productId, quantity]) => ({ productId, quantity }));
    }

    // Already in the correct format, just ensure integrity
    return items
        .filter(item => item && item.productId && typeof item.quantity === 'number')
        .map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
        }));
};

export const mapSubscription = (doc: any): Subscription => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId || '',
    items: mapSubscriptionItems(data.items),
    frequency: data.frequency || 'monthly',
    active: data.active ?? false,
    nextDelivery: toISOString(data.nextDelivery),
    createdAt: toISOString(data.createdAt),
  };
};

export const mapReturnRequest = (doc: any): ReturnRequest => {
    const data = doc.data();
    return {
        id: doc.id,
        orderId: data.orderId || '',
        userId: data.userId || '',
        userName: data.userName || '',
        userEmail: data.userEmail || '',
        orderTotal: data.orderTotal || 0,
        orderDate: data.orderDate || '', // This should already be a string
        status: data.status || 'pending',
        requestedAt: toISOString(data.requestedAt),
    }
}
