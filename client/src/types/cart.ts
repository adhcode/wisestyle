import { Product } from './product';
import { Size } from './size';
import { Color } from './color';

export interface CartItem extends Product {
    quantity: number;
    selectedSize: Size;
    selectedColor: Color;
} 