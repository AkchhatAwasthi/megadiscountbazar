import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  rating?: number;
  reviews?: number;
  description?: string;
  weight?: string;
  pieces?: string;
  inStock?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  slug?: string;
  product_specs?: any;
  care_instructions?: string;
  available_sizes?: string[];
  available_weights?: string[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedWeight?: string;
}

interface Store {
  // Cart
  cartItems: CartItem[];
  isCartOpen: boolean;
  addToCart: (product: Product, size?: string, weight?: string) => void;
  removeFromCart: (productId: string, size?: string, weight?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, weight?: string) => void;
  clearCart: () => void;
  toggleCart: () => void;

  // Notification
  notification: {
    isOpen: boolean;
    item: CartItem | null;
  };
  setNotification: (item: CartItem) => void;
  closeNotification: () => void;

  // Products
  products: Product[];
  selectedCategory: string;
  setProducts: (products: Product[]) => void;
  setSelectedCategory: (category: string) => void;

  // Animation
  animation: {
    isOpen: boolean;
    type: 'add-to-basket' | 'bye-bye' | 'welcome' | 'order-confirmed' | null;
  };
  triggerAnimation: (type: 'add-to-basket' | 'bye-bye' | 'welcome' | 'order-confirmed') => void;
  closeAnimation: () => void;

  // User
  isAuthenticated: boolean;
  user: null | { name: string; email: string };
  login: (user: { name: string; email: string }) => void;
  logout: () => void;
}

// Load cart items from localStorage on initial load
const loadCartFromLocalStorage = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    try {
      const storedCart = localStorage.getItem('cartItems');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  }
  return [];
};

// Save cart items to localStorage
const saveCartToLocalStorage = (cartItems: CartItem[]): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Cart state
      cartItems: loadCartFromLocalStorage(),
      isCartOpen: false,

      // Notification state
      notification: {
        isOpen: false,
        item: null,
      },

      setNotification: (item: CartItem) => set({ notification: { isOpen: true, item } }),
      closeNotification: () => set((state) => ({ notification: { ...state.notification, isOpen: false } })),

      // Animation state
      animation: {
        isOpen: false,
        type: null,
      },
      triggerAnimation: (type: 'add-to-basket' | 'bye-bye' | 'welcome' | 'order-confirmed') => set({ animation: { isOpen: true, type } }),
      closeAnimation: () => set((state) => ({ animation: { ...state.animation, isOpen: false } })),

      // Cart actions
      addToCart: (product, size, weight) => {
        const { cartItems } = get();
        // Check if item with same ID AND same size AND same weight exists
        const existingItem = cartItems.find(item =>
          item.id === product.id && item.selectedSize === size && item.selectedWeight === weight
        );

        let updatedCartItems;
        let itemToAdd;

        if (existingItem) {
          updatedCartItems = cartItems.map(item =>
            (item.id === product.id && item.selectedSize === size && item.selectedWeight === weight)
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          itemToAdd = { ...existingItem, quantity: existingItem.quantity + 1 };
        } else {
          itemToAdd = { ...product, quantity: 1, selectedSize: size, selectedWeight: weight };
          updatedCartItems = [...cartItems, itemToAdd];
        }

        set({ cartItems: updatedCartItems });
        get().setNotification(itemToAdd); // Trigger notification
        get().triggerAnimation('add-to-basket'); // Trigger lottie animation
        saveCartToLocalStorage(updatedCartItems);
      },

      removeFromCart: (productId, size, weight) => {
        const updatedCartItems = get().cartItems.filter(item =>
          !(item.id === productId && item.selectedSize === size && item.selectedWeight === weight)
        );
        set({ cartItems: updatedCartItems });
        saveCartToLocalStorage(updatedCartItems);
      },

      updateQuantity: (productId, quantity, size, weight) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, size, weight);
          return;
        }

        const updatedCartItems = get().cartItems.map(item =>
          (item.id === productId && item.selectedSize === size && item.selectedWeight === weight)
            ? { ...item, quantity }
            : item
        );

        set({ cartItems: updatedCartItems });
        saveCartToLocalStorage(updatedCartItems);
      },

      clearCart: () => {
        set({ cartItems: [] });
        saveCartToLocalStorage([]);
      },

      toggleCart: () => set({ isCartOpen: !get().isCartOpen }),

      // Products state
      products: [],
      selectedCategory: 'All',
      setProducts: (products) => set({ products }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),

      // User state
      isAuthenticated: false,
      user: null,
      login: (user) => set({ isAuthenticated: true, user }),
      logout: () => {
        set({ isAuthenticated: false, user: null });
        get().triggerAnimation('bye-bye');
      },
    }),
    {
      name: 'sweetsshop-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cartItems: state.cartItems,
        // We only persist cart items, not the entire state
      }),
    }
  )
);