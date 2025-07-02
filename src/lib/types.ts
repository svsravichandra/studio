
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    phone?: string;
    address?: Address;
    role: 'customer' | 'admin';
    createdAt: string; 
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  gritLevel: 'None' | 'Light' | 'Medium' | 'Heavy';
  scentProfile: string;
  stock: number;
  isFeatured: boolean;
  imageUrl: string;
  tags: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderProduct {
    productId: string;
    name: string; // Denormalized for display
    imageUrl: string; // Denormalized for display
    quantity: number;
    price: number; // Price at time of purchase
}

export interface Order {
    id: string;
    userId: string;
    items: OrderProduct[];
    total: number;
    status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shippingAddress: Address;
    trackingNumber?: string;
    carrier?: string;
    paymentIntentId?: string;
    createdAt: string; 
}

export interface SubscriptionProduct {
    productId: string;
    quantity: number;
}

export interface Subscription {
    id: string;
    userId: string;
    items: SubscriptionProduct[]; // Array of product IDs and quantities
    frequency: 'monthly' | 'bi-monthly';
    active: boolean;
    stripeSubscriptionId?: string;
    nextDelivery: string;
    createdAt: string;
}
