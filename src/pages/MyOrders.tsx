import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Edit, IndianRupee } from "lucide-react";
import { CartDrawer } from "@/components/CartDrawer";
import { useEffect, useState } from "react";
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
}

// this comes from the API response 
export type ServerOrder = {
  _id: string;
  tableNumber: number;
  items: OrderItem[];
  orderItems: OrderItemStatus[]; // ✅ NEW
  specialInstruction?: string;
  totalAmount: number;
  subTotal: number;
  gstAmount: number;
  gstPercent: number;
  isCompleted: boolean; // ✅ replaces orderStatus
  paymentStatus: boolean;
  createdAt: string;
}

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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orders, setOrders] = useState<ServerOrder[]>([]);
  const [editingOrder, setEditingOrder] = useState<ServerOrder | null>(null);
  const [isEditingCartOpen, setIsEditingCartOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.order) {
      setOrders(prev => {
        const exists = prev.find(o => o._id === location.state.order._id);
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

  const getItemStatusBreakdown = (order: ServerOrder, item: OrderItem) => {
    const relatedItems = order.orderItems.filter(
      (oi) => oi.menuId === item.menu._id
    );
    const breakdown = {
      pending: 0,
      preparing: 0,
      served: 0,
    };

    relatedItems.forEach((oi) => {
      breakdown[oi.status]++;
    });

    return breakdown;
  };

  useEffect(() => {
    if (data?.result?.results) {
      setOrders(data.result.results);
    }
  }, [data]);

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
      setOrders(prev => {
        const exists = prev.find(o => o._id === order._id);
        return exists ? prev : [order, ...prev];
      });
    };

    const handleStatusUpdate = ({ orderId, order }: any) => {
      setOrders(prev =>
        prev.map(o => (o._id === orderId ? order : o))
      );

      toast.success(
        `Order #${order.tableNumber} is now ${order.orderStatus}`,
      );
    };

    socket.on("order:new", handleNewOrder);
    socket.on("order:statusUpdated", handleStatusUpdate);

    return () => {
      socket.off("order:new", handleNewOrder);
      socket.off("order:statusUpdated", handleStatusUpdate);
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

    <>
      <section className="container mx-auto px-4 pt-24 pb-10">
        <h1 className="font-display text-3xl mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <p className="text-muted-foreground">No orders found.</p>
        ) : (
          <div className="space-y-6">
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
                    <CardContent className="p-5 space-y-4">

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Table #{order.tableNumber}
                          </p>
                        </div>
                        <Badge className={`capitalize ${statusStyles[orderStatus]}`}>
                          {orderStatus}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {order.orderItems.map((item) => {
                          const menu = order.items.find(i => i.menu._id === item.menuId)?.menu; return (
                            <div key={item._id} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <span>{menu?.name} × {item.quantity}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${itemStatusStyles[item.status]}`}>
                                  {item.status}
                                </span>
                              </div>
                              <span>₹{(menu?.discountPrice ?? menu?.price ?? 0) * item.quantity}</span>
                            </div>
                          );
                        })}
                      </div>

                      {order.specialInstruction && (
                        <p className="text-sm italic text-muted-foreground">
                          “{order.specialInstruction}”
                        </p>
                      )}

                      <div className="border-t pt-3 space-y-3">

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {new Date(order.createdAt).toLocaleString()}
                        </div>

                        <div className="ml-auto w-40 space-y-1 text-sm">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span>₹{order.subTotal}</span>
                          </div>

                          <div className="flex justify-between text-muted-foreground">
                            <span>GST ({order.gstPercent}%)</span>
                            <span>₹{order.gstAmount}</span>
                          </div>

                          <div className="flex justify-between font-semibold border-t pt-1 ">
                            <span>Total</span>
                            <span className="flex items-center gap-1">
                              <IndianRupee className="h-4 w-4" />
                              {order.totalAmount}
                            </span>
                          </div>
                        </div>

                      </div>

                      {!order.isCompleted && hasEditableItems && (
                        <button
                          onClick={() => {
                            const pendingItems: CartItem[] = order.orderItems
                              .filter(
                                (item) =>
                                  item.status === "pending" &&
                                  item.customerId?.toString() ===
                                  user?._id?.toString()
                              )
                              .map(item => {
                                const menu = order.items.find(i => i.menu._id === item.menuId)?.menu;
                                return {
                                  id: item._id,
                                  menuId: item.menuId,
                                  name: menu?.name ?? "",
                                  price: menu?.price ?? 0,
                                  discountPrice: menu?.discountPrice ?? menu?.price ?? 0,
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
                          <Edit />
                        </button>
                      )}

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
  );
}
