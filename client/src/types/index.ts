export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  slug: string;
  categoryId: string;
  image: string;
  isLimited: boolean;
  displaySection: string;
  status: string;
  stock: number;
  tags: string[];
  category?: Category;
  sizes?: Size[];
  colors?: Color[];
  inventory?: ProductInventory[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: string;
  isActive: boolean;
  imageUrl?: string;
  image?: string;
  displayOrder: number;
  parentId?: string;
  parent?: Category;
  children: Category[];
  products?: any[];
  _count: {
    products: number;
    children: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Size {
  id: string;
  name: string;
  value: string;
  category: string;
}

export interface Color {
  id: string;
  name: string;
  value: string;
  class: string;
}

export interface ProductInventory {
  id: string;
  productId: string;
  sizeId: string;
  colorId: string;
  quantity: number;
  size: Size;
  color: Color;
} 