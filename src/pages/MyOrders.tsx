import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, IndianRupee } from "lucide-react";
import { CartDrawer } from "@/components/CartDrawer";
import { useEffect, useState } from "react";
import API_ROUTES from "@/utils/api_constant";
import { useFetch } from "@/utils/useApi";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";
import { socket } from "@/socket";
import toast from "react-hot-toast";

interface OrderItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  tableNumber: number;
  items: OrderItem[];
  specialInstruction?: string;
  totalAmount: number;
  orderStatus: "pending" | "accepted" | "completed";
  paymentStatus: boolean;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  completed: "bg-gray-200 text-gray-800",
};

export default function MyOrders() {
  const { user } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.order) {
      setOrders(prev => {
        const exists = prev.find(o => o._id === location.state.order._id);
        return exists ? prev : [location.state.order, ...prev];
      });
    }
  }, [location.state]);

  const { data, isLoading } = useFetch(
    "",
    API_ROUTES.getCustomerOrder,
    { userId: user?._id },
    { enabled: !!(user?._id) }
  );

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
    const handleNewOrder = (order: Order) => {
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
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-md">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Order ID</p>
                        <p className="font-mono text-xs">{order._id}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Table #{order.tableNumber}
                        </p>
                      </div>

                      <Badge className={`capitalize ${statusStyles[order.orderStatus]}`}>
                        {order.orderStatus}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {order.items.map(item => (
                        <div key={item.menuId} className="flex justify-between text-sm">
                          <span>{item.name} × {item.quantity}</span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {order.specialInstruction && (
                      <p className="text-sm italic text-muted-foreground">
                        “{order.specialInstruction}”
                      </p>
                    )}

                    <div className="flex justify-between items-center border-t pt-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {new Date(order.createdAt).toLocaleString()}
                      </div>

                      <div className="flex items-center gap-1 font-semibold">
                        <IndianRupee className="h-4 w-4" />
                        {order.totalAmount}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}
