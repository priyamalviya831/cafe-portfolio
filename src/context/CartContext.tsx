import React, { createContext, useContext, useState, useCallback } from "react";
import { CartItem, MenuItem } from "@/types/cafe";
import { useDelete, usePatch } from "@/utils/useApi";
import { API_ROUTES } from "@/utils/api_constant";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { queryClient } from "@/App";

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  setCartItems: (items: CartItem[]) => void;
  clearCart: () => void;
  editingOrderId: string | null;
  setEditingOrderId: (orderId: string | null) => void;
  total: number;
  itemCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const { user } = useAuth();

  const { mutate: updateOrderItem } = usePatch(API_ROUTES.updateOrderItem, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-orders"], exact: false });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update order item");
    },
  });

  const { mutate: deleteOrderItem } = useDelete(API_ROUTES.deleteOrderItem, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-orders"], exact: false });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete order item");
    },
  });

  const addItem = useCallback((item: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback(
    (itemId: string) => {
      if (editingOrderId) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));

        if (!user?._id) {
          toast.error("Please login to delete items");
          return;
        }

        deleteOrderItem({ id: itemId, customerId: user._id });
        return;
      }

      setItems((prev) => prev.filter((i) => i.id !== itemId));
    },
    [editingOrderId, deleteOrderItem, user?._id]
  );

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (editingOrderId) {
        if (quantity < 1) return;

        setItems((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
        );

        if (!user?._id) {
          toast.error("Please login to update items");
          return;
        }

        updateOrderItem({
          orderItemId: itemId,
          quantity,
          customerId: user._id,
        });
        return;
      }

      if (quantity <= 0) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
      } else {
        setItems((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
        );
      }
    },
    [editingOrderId, updateOrderItem, user?._id]
  );

  const setCartItems = useCallback((newItems: CartItem[]) => {
    setItems(newItems);
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setEditingOrderId(null);
  }, []);

  const total = items.reduce((sum, item) => sum + item.discountPrice * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        setCartItems,
        clearCart,
        editingOrderId,
        setEditingOrderId,
        total,
        itemCount,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
