import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { StateCreator } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

interface CartStore {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string, selectedSize: string, selectedColor: string) => void;
  updateQuantity: (itemId: string, selectedSize: string, selectedColor: string, quantity: number) => void;
  clearCart: () => void;
}

type CartPersist = (
  config: StateCreator<CartStore>,
  options: PersistOptions<CartStore>
) => StateCreator<CartStore>;

export const useCart = create<CartStore>()(
  (persist as CartPersist)(
    (set) => ({
      items: [],
      addToCart: (item: CartItem) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) =>
              i.id === item.id &&
              i.selectedSize === item.selectedSize &&
              i.selectedColor === item.selectedColor
          );

          if (existingItem) {
  return {
              items: state.items.map((i) =>
                i.id === item.id &&
                i.selectedSize === item.selectedSize &&
                i.selectedColor === item.selectedColor
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }

          return { items: [...state.items, item] };
        }),
      removeFromCart: (itemId: string, selectedSize: string, selectedColor: string) =>
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.id === itemId &&
                i.selectedSize === selectedSize &&
                i.selectedColor === selectedColor
              )
          ),
        })),
      updateQuantity: (itemId: string, selectedSize: string, selectedColor: string, quantity: number) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId &&
            i.selectedSize === selectedSize &&
            i.selectedColor === selectedColor
              ? { ...i, quantity }
              : i
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
    }
  )
); 