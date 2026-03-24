import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Clock, Edit, IndianRupee, MessageSquare } from "lucide-react";
import { CartDrawer } from "@/components/CartDrawer";
import { useEffect, useRef, useState } from "react";
import { API_ROUTES } from "@/utils/api_constant";
import { useFetch } from "@/utils/useApi";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";
import { socket } from "@/socket";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { CartItem } from "@/types/cafe";

interface Menu {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
}

interface Customer {
  _id: string;
  name: string;
  phoneNumber: string;
}

interface OrderItem {
  menu: Menu;
  quantity: number;
  price: number;
  customers: Customer[];
  amount: number;
}

interface OrderItemStatus {
  _id: string;
  menuId: string;
  quantity: number;
  status: "pending" | "preparing" | "served";
  customerId?: string;
  specialInstruction?: string;
}

export type ServerOrder = {
  _id: string;
  tableNumber: number;
  items: OrderItem[];
  orderItems: OrderItemStatus[];
  specialInstruction?: string;
  totalAmount: number;
  subTotal: number;
  gstAmount: number;
  gstPercent: number;
  isCompleted: boolean;
  paymentStatus: boolean;
  createdAt: string;
};

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
};

const itemStatusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  preparing: "bg-blue-100 text-blue-700",
  served: "bg-green-100 text-green-700",
};

export function MyOrders() {
  const { user } = useAuth();
  const { setCartItems, setEditingOrderId } = useCart();
  const [orders, setOrders] = useState<ServerOrder[]>([]);
  const [editingOrder, setEditingOrder] = useState<ServerOrder | null>(null);
  const [isEditingCartOpen, setIsEditingCartOpen] = useState(false);
  const ordersRef = useRef<ServerOrder[]>([]);
  const lastToastRef = useRef<Map<string, number>>(new Map());

  const location = useLocation();

  useEffect(() => {
    if (location.state?.order) {
      setOrders((prev) => {
        const exists = prev.find((o) => o._id === location.state.order._id);
        return exists ? prev : [location.state.order, ...prev];
      });
    }
  }, [location.state]);

  const { data, isLoading, refetch } = useFetch(
    "customer-orders",
    API_ROUTES.getCustomerOrder,
    { userId: user?._id },
    { enabled: !!(user?._id) }
  );
  const refetchRef = useRef(refetch);

  useEffect(() => {
    if (data?.result?.results) {
      setOrders(data.result.results);
    }
  }, [data]);

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // useEffect(() => {
  //   refetchRef.current = refetch;
  // }, [refetch]);

  useEffect(() => {
    if (!user?._id) return;
    socket.connect();
    socket.emit("join-customer", user._id.toString());
    return () => {
      socket.off();
      socket.disconnect();
    };
  }, [user?._id]);

  useEffect(() => {
    const handleNewOrder = (order: ServerOrder) => {
      setOrders((prev) => {
        const exists = prev.find((o) => o._id === order._id);
        return exists ? prev : [order, ...prev];
      });
    };

    const applyOrderUpdate = (orderId: string, next: Partial<ServerOrder>) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, ...next } : o))
      );
    };

    const handleOrderStatusUpdate = (payload: any) => {
      const orderId = payload?.orderId ?? payload?.order?._id;
      const order = payload?.order;
      if (!orderId) return;

      if (order) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? order : o)));
        const statusText = order.isCompleted ? "completed" : "pending";
        const key = `order:${orderId}:${statusText}`;
        const now = Date.now();
        const last = lastToastRef.current.get(key) ?? 0;
        if (now - last > 4000) {
          toast.success(`Order #${order.tableNumber} is now ${statusText}`);
          lastToastRef.current.set(key, now);
        }
        return;
      }

      if (typeof payload?.isCompleted === "boolean") {
        applyOrderUpdate(orderId, { isCompleted: payload.isCompleted });
        const statusText = payload.isCompleted ? "completed" : "pending";
        const key = `order:${orderId}:${statusText}`;
        const now = Date.now();
        const last = lastToastRef.current.get(key) ?? 0;
        if (now - last > 4000) {
          toast.success(
            `Order #${payload.tableNumber ?? ""} is now ${statusText}`.trim()
          );
          lastToastRef.current.set(key, now);
        }
      }
    };

    const handleOrderItemStatusUpdate = (payload: any) => {
      const orderId = payload?.orderId ?? payload?.order?._id;
      const orderItemId = payload?.orderItemId ?? payload?.orderItem?._id;
      const status = payload?.status ?? payload?.orderItem?.status;
      const quantity = payload?.quantity ?? payload?.orderItem?.quantity;
      const order = payload?.order;

      if (!orderId) return;

      if (order) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? order : o)));
      } else if (Array.isArray(payload?.orderItems)) {
        applyOrderUpdate(orderId, { orderItems: payload.orderItems });
      } else if (orderItemId && (status || typeof quantity === "number")) {
        setOrders((prev) =>
          prev.map((o) => {
            if (o._id !== orderId) return o;
            return {
              ...o,
              orderItems: o.orderItems.map((oi) =>
                oi._id === orderItemId
                  ? {
                    ...oi,
                    ...(status ? { status } : {}),
                    ...(typeof quantity === "number" ? { quantity } : {}),
                  }
                  : oi
              ),
            };
          })
        );
      }

      if (status || typeof quantity === "number") {
        const currentOrder = ordersRef.current.find((o) => o._id === orderId);
        const menuId =
          payload?.menuId ??
          payload?.orderItem?.menuId ??
          currentOrder?.orderItems.find((oi) => oi._id === orderItemId)?.menuId;
        const menuName =
          currentOrder?.items.find((i) => i.menu._id === menuId)?.menu?.name ??
          "Item";
        const tableLabel = currentOrder?.tableNumber
          ? ` on Table #${currentOrder.tableNumber}`
          : "";
        if (status) {
          const key = `item:${orderId}:${orderItemId}:${status}`;
          const now = Date.now();
          const last = lastToastRef.current.get(key) ?? 0;
          if (now - last > 4000) {
            toast.success(`${menuName} is now ${status}${tableLabel}`);
            lastToastRef.current.set(key, now);
          }
        } else if (typeof quantity === "number") {
          const key = `item:${orderId}:${orderItemId}:qty:${quantity}`;
          const now = Date.now();
          const last = lastToastRef.current.get(key) ?? 0;
          if (now - last > 4000) {
            toast.success(`${menuName} quantity updated${tableLabel}`);
            lastToastRef.current.set(key, now);
          }
        }
      }
    };

    socket.on("order:new", handleNewOrder);
    socket.on("order:statusUpdated", handleOrderStatusUpdate);
    // socket.on("order:itemStatusUpdated", handleOrderItemStatusUpdate);
    socket.on("orderItem:statusUpdated", handleOrderItemStatusUpdate);

    const handleAny = (event: string, payload: any) => {
      if (
        event === "order:new" ||
        event === "order:statusUpdated" ||
        event === "order:itemStatusUpdated" ||
        event === "orderItem:statusUpdated"
      ) {
        return;
      }
      if (
        payload?.orderId ||
        payload?.order?._id ||
        payload?.orderItems ||
        payload?.orderItem
      ) {
        refetchRef.current();
        return;
      }
      if (event.toLowerCase().includes("order")) {
        refetchRef.current();
      }
    };
    socket.onAny(handleAny);

    return () => {
      socket.off("order:new", handleNewOrder);
      socket.off("order:statusUpdated", handleOrderStatusUpdate);
      socket.off("order:itemStatusUpdated", handleOrderItemStatusUpdate);
      socket.off("orderItem:statusUpdated", handleOrderItemStatusUpdate);
      socket.offAny(handleAny);
    };
  }, []);

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 pt-24">
        <p className="text-muted-foreground">Loading orders...</p>
      </section>
    );
  }

  return (
    <TooltipProvider>
      <>
        <section className="container mx-auto px-3 sm:px-4 pt-24 pb-10 max-w-2xl">
          <h1 className="font-display text-2xl sm:text-3xl mb-6 sm:mb-8">
            My Orders
          </h1>

          {orders.length === 0 ? (
            <p className="text-muted-foreground">No orders found.</p>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {orders.map((order, index) => {
                const orderStatus = order.isCompleted ? "completed" : "pending";
                const hasEditableItems = order.orderItems.some(
                  (item) =>
                    item.status === "pending" &&
                    item.customerId?.toString() === user?._id?.toString()
                );

                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="shadow-md relative">
                      <CardContent className="p-4 sm:p-5 space-y-4">

                        {/* Header: Table # and status badge */}
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium text-muted-foreground">
                            Table #{order.tableNumber}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`capitalize ${statusStyles[orderStatus]}`}
                            >
                              {orderStatus}
                            </Badge>
                            {!order.isCompleted && hasEditableItems && (
                              <button
                                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                                onClick={() => {
                                  const pendingItems: CartItem[] =
                                    order.orderItems
                                      .filter(
                                        (item) =>
                                          item.status === "pending" &&
                                          item.customerId?.toString() ===
                                          user?._id?.toString()
                                      )
                                      .map((item) => {
                                        const menu = order.items.find(
                                          (i) => i.menu._id === item.menuId
                                        )?.menu;
                                        return {
                                          id: item._id,
                                          menuId: item.menuId,
                                          name: menu?.name ?? "",
                                          price: menu?.price ?? 0,
                                          discountPrice:
                                            menu?.discountPrice ??
                                            menu?.price ??
                                            0,
                                          quantity: item.quantity,
                                          orderItemId: item._id,
                                        };
                                      });

                                  setCartItems(pendingItems);
                                  setEditingOrderId(order._id);
                                  setEditingOrder(order);
                                  setIsEditingCartOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Order items list */}
                        <div className="space-y-2">
                          {order.orderItems.map((item) => {
                            const menu = order.items.find(
                              (i) => i.menu._id === item.menuId
                            )?.menu;
                            const itemTotal =
                              (menu?.discountPrice ?? menu?.price ?? 0) *
                              item.quantity;

                            return (
                              <div
                                key={item._id}
                                className="flex items-start justify-between gap-2 text-sm py-1 border-b border-dashed border-muted last:border-0"
                              >
                                {/* Left: name + status + special instruction stacked */}
                                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="font-medium truncate">
                                      {menu?.name} × {item.quantity}
                                    </span>
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded shrink-0 ${itemStatusStyles[item.status]}`}
                                    >
                                      {item.status}
                                    </span>
                                  </div>

                                  {item.specialInstruction && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <p className="text-xs italic text-muted-foreground flex items-center gap-1 cursor-default w-fit max-w-full">
                                          <MessageSquare className="h-3 w-3 shrink-0" />
                                          <span className="truncate max-w-[180px] sm:max-w-xs">
                                            {item.specialInstruction}
                                          </span>
                                        </p>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="bottom"
                                        className="max-w-xs text-xs"
                                      >
                                        <p className="font-medium mb-0.5 text-muted-foreground">
                                          Special instruction
                                        </p>
                                        <p>{item.specialInstruction}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>

                                {/* Right: price */}
                                <span className="shrink-0 font-medium">
                                  ₹{itemTotal}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Footer: time + totals */}
                        <div className="border-t pt-3 space-y-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span>
                              {new Date(order.createdAt).toLocaleString()}
                            </span>
                          </div>

                          {/* Totals — full width on mobile, right-aligned on sm+ */}
                          <div className="w-full sm:w-44 sm:ml-auto space-y-1 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                              <span>Subtotal</span>
                              <span>₹{order.subTotal}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>GST ({order.gstPercent}%)</span>
                              <span>₹{order.gstAmount}</span>
                            </div>
                            <div className="flex justify-between font-semibold border-t pt-1">
                              <span>Total</span>
                              <span className="flex items-center gap-0.5">
                                <IndianRupee className="h-3.5 w-3.5" />
                                {order.totalAmount}
                              </span>
                            </div>
                          </div>
                        </div>

                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        <CartDrawer
          isOpen={isEditingCartOpen}
          onClose={() => {
            setIsEditingCartOpen(false);
            setEditingOrder(null);
            refetch();
          }}
          editingOrder={editingOrder}
        />
      </>
    </TooltipProvider>
  );
}