
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  hint: string;
  featured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem extends Product {
    quantity: number;
}

export interface Order {
    id: string;
    userId: string; // Keep track of which user this order belongs to
    date: string;
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned' | 'Refunded';
    total: number;
    items: OrderItem[];
}

export interface Subscription {
    id: string;
    status: 'Active' | 'Paused' | 'Cancelled';
    frequency: 'Monthly' | 'Quarterly';
    nextBillingDate: string;
    products: OrderItem[];
    total: number;
}

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string;
    role: 'admin' | 'user';
    createdAt: string;
}
