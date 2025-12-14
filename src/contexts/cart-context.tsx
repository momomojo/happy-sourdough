'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { toast } from 'sonner';

export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
  special_instructions?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'happy-sourdough-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (error) {
        Sentry.captureException(error, {
          tags: { cart_action: 'load', source: 'localStorage' },
        });
        console.error('Error loading cart:', error);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const quantity = newItem.quantity || 1;

    // Add breadcrumb for debugging checkout issues
    Sentry.addBreadcrumb({
      category: 'cart',
      message: `Add item: ${newItem.productName}`,
      level: 'info',
      data: { productId: newItem.productId, variantId: newItem.variantId, quantity, special_instructions: newItem.special_instructions },
    });

    setItems(current => {
      const existingIndex = current.findIndex(item =>
        item.variantId === newItem.variantId &&
        // Only merge items if they have the same special instructions
        item.special_instructions === newItem.special_instructions
      );

      if (existingIndex > -1) {
        // Update existing item
        const updated = [...current];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        toast.success(`Updated ${newItem.productName} in cart`);
        return updated;
      } else {
        // Add new item
        toast.success(`Added ${newItem.productName} to cart`);
        return [...current, { ...newItem, quantity }];
      }
    });
  }, []);

  const removeItem = useCallback((variantId: string) => {
    // Add breadcrumb for debugging checkout issues
    Sentry.addBreadcrumb({
      category: 'cart',
      message: 'Remove item',
      level: 'info',
      data: { variantId },
    });

    setItems(current => {
      const item = current.find(i => i.variantId === variantId);
      if (item) {
        toast.success(`Removed ${item.productName} from cart`);
      }
      return current.filter(item => item.variantId !== variantId);
    });
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }

    setItems(current => {
      const updated = [...current];
      const index = updated.findIndex(item => item.variantId === variantId);
      if (index > -1) {
        updated[index] = { ...updated[index], quantity };
      }
      return updated;
    });
  }, [removeItem]);

  const clearCart = useCallback(() => {
    // Add breadcrumb for debugging checkout issues
    Sentry.addBreadcrumb({
      category: 'cart',
      message: 'Clear cart',
      level: 'info',
      data: { itemCount: items.length },
    });

    setItems([]);
    toast.success('Cart cleared');
  }, [items.length]);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
