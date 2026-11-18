import React, { createContext, useContext, useEffect, useState } from 'react';
import type { OrderItem, OrderCustomization, Category } from '../types/index.js';

export interface CartItem {
  id: string; // unique cart entry ID
  menuItemId: string;
  name: string;
  category?: Category;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
  preparationTime: number;
  customization?: OrderCustomization;
  specialInstructions?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: {
    menuItemId: string;
    name: string;
    category?: Category;
    unitPrice: number;
    image?: string;
    preparationTime?: number;
    customization?: OrderCustomization;
    specialInstructions?: string;
    quantity?: number;
  }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('bb_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bb_cart', JSON.stringify(items));
    } catch (e) {
      console.error('[CartContext] Save error:', e);
    }
  }, [items]);

  const addItem = (input: {
    menuItemId: string;
    name: string;
    category?: Category;
    unitPrice: number;
    image?: string;
    preparationTime?: number;
    customization?: OrderCustomization;
    specialInstructions?: string;
    quantity?: number;
  }) => {
    const qty = input.quantity || 1;
    const extraPrice = input.customization?.extraPrice || 0;
    const effectiveUnitPrice = input.unitPrice + extraPrice;

    setItems((prev) => {
      // Check if item with exact same menuItemId and customization already exists
      const customizationKey = JSON.stringify(input.customization || {});
      const existingIndex = prev.findIndex(
        (i) =>
          i.menuItemId === input.menuItemId &&
          JSON.stringify(i.customization || {}) === customizationKey &&
          (i.specialInstructions || '') === (input.specialInstructions || '')
      );

      if (existingIndex > -1) {
        const copy = [...prev];
        const existing = copy[existingIndex];
        const newQty = Math.min(20, existing.quantity + qty);
        copy[existingIndex] = {
          ...existing,
          quantity: newQty,
          totalPrice: newQty * existing.unitPrice,
        };
        return copy;
      } else {
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          menuItemId: input.menuItemId,
          name: input.name,
          category: input.category,
          quantity: qty,
          unitPrice: effectiveUnitPrice,
          totalPrice: effectiveUnitPrice * qty,
          image: input.image,
          preparationTime: input.preparationTime || 5,
          customization: input.customization,
          specialInstructions: input.specialInstructions,
        };
        return [...prev, newItem];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: Math.min(20, nextQty),
              totalPrice: Math.min(20, nextQty) * item.unitPrice,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + tax;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        tax,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
