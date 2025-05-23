export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  size: string[];
  color: string[];
  inStock: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
} 