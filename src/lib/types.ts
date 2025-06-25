
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  hint: string;
}

export interface CartItem extends Product {
  quantity: number;
}
