import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { socket } from "@/socket";
import { useAuth } from "@/context/AuthContext";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  orderId?: string;
};

type NotificationContextValue = {
  notifications: NotificationItem[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearAll: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

const STORAGE_PREFIX = "customer_notifications";

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const getOrderStatusLabel = (order: any, status?: string) => {
  if (typeof status === "string" && status.length > 0) return status;
  if (typeof order?.orderStatus === "string" && order.orderStatus.length > 0) {
    return order.orderStatus;
  }
  if (typeof order?.isCompleted === "boolean") {
    return order.isCompleted ? "completed" : "pending";
  }
  return "updated";
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const storageKey = user?._id ? `${STORAGE_PREFIX}:${user._id}` : null;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!storageKey) {
      setNotifications([]);
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as NotificationItem[];
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
        }
      }
    } catch {
      setNotifications([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    } catch {
      // ignore storage write errors (private mode, quota, etc.)
    }
  }, [notifications, storageKey]);

  useEffect(() => {
    if (!user?._id) return;

    socket.connect();
    socket.emit("join-customer", user._id.toString());

    const handleStatusUpdate = ({ orderId, order, status }: any) => {
      const statusLabel = getOrderStatusLabel(order, status);
      const tableNumber = order?.tableNumber;
      const message = tableNumber
        ? `Table #${tableNumber} is now ${statusLabel}.`
        : `Your order status is now ${statusLabel}.`;

      const nextNotification: NotificationItem = {
        id: createId(),
        title: "Order status updated",
        message,
        createdAt: new Date().toISOString(),
        read: false,
        orderId,
      };

      setNotifications((prev) => [nextNotification, ...prev]);
    };

    socket.on("order:statusUpdated", handleStatusUpdate);

    return () => {
      socket.off("order:statusUpdated", handleStatusUpdate);
      socket.disconnect();
    };
  }, [user?._id]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAllRead,
      markRead,
      clearAll,
    }),
    [notifications, unreadCount],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used inside NotificationProvider");
  }
  return context;
};
