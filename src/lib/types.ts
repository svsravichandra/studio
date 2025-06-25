
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
    date: string;
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    total: number;
    items: OrderItem[];
}

export interface SubscriptionProduct extends Product {
    quantity: number;
}

export interface Subscription {
    id: string;
    status: 'Active' | 'Paused' | 'Cancelled';
    frequency: 'Monthly' | 'Quarterly';
    nextBillingDate: string;
    products: SubscriptionProduct[];
    total: number;
}
