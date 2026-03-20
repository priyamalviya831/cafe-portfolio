import { LAYOUTS } from "@/utils/constants";

export type LayoutType = typeof LAYOUTS[keyof typeof LAYOUTS];

export interface Admin {
  _id: string;
  logo: string;
  email: string;
  phoneNumber: string;
  address: string;
  gst?: number;
  cafeName: string;
  hours: {
    weekdays: string;
    weekends: string;
  };
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  role: string
}

export interface CafeConfig {
  layoutTitle: LayoutType;
  adminId: Admin;

  cafeDescription: string;
  homeImage: string;
  aboutImage: string;

  menuTitle: string;
  menu: MenuItem[];

  aboutTitle: string;
  aboutDescription: string;
}
export interface CafeBootstrapResponse {
  success: boolean;
  message: string;
  result: CafeConfig & {
    _id: string;
    defaultLayout: boolean;
    // 🔑 present ONLY when defaultLayout === false
    defaultLayoutId?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  image?: string;
  category?: string;
  isPopular?: boolean;
  isNew?: boolean;
   isActive?: boolean;
  inStock?: boolean;
}

export type MenuCategory = 'coffee' | 'tea' | 'pastries' | 'breakfast' | 'lunch' | 'desserts' | 'beverages';

export interface CartItem extends MenuItem {
  quantity: number;
  // Present when editing an existing order item
  orderItemId?: string;
  // Original menu id when cart item represents an order item
  menuId?: string;
}

// client side order type to create order
export type CreateOrder = {
  id: string;
  items: CartItem[];
  total: number;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  createdAt: Date;
  notes?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
