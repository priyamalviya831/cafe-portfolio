import { motion } from 'framer-motion';
import { ShoppingCart, Menu, X, Coffee, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useLayout } from '@/context/LayoutContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LAYOUTS } from '@/utils/constants';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useFetch } from "@/utils/useApi";
import {API_ROUTES} from "@/utils/api_constant";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { layoutType, config } = useLayout();;
  const { qrId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();

  const { data: ordersData } = useFetch(
    `order-${user?._id}`,
    API_ROUTES.getCustomerOrder,
    { userId: user?._id },
    {
      enabled: !!user?._id,
      staleTime: 5 * 60 * 1000, // cache for 5 mins
    }
  );

  const hasOrders =
    (ordersData?.result?.results?.length ?? 0) > 0;

  const navItems = [
    { label: "Home", section: "home" },
    { label: "Menu", section: "menu" },
    { label: "About", section: "about" },
    { label: "Contact", section: "contact" },
  ];
  const basePath = `/${qrId}`;

  const isElegant = layoutType === LAYOUTS.ELEGANT;

  const handleNavClick = (section: string) => {
    if (location.pathname === basePath) {
      document
        .getElementById(section)
        ?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(basePath, { state: { scrollTo: section } });
    }
    setIsMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 ${isElegant
        ? "glass-effect border-b border-border/50"
        : "bg-card shadow-soft"
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" 
          onClick={() => {
            if (location.pathname === `/${qrId}`) {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              navigate(`/${qrId}`);
            }
          }}>
            {config?.adminId?.logo ? (
              <img
                src={config.adminId.logo}
                alt="logo"
                className="w-8 h-8 md:w-12 md:h-12 rounded-full object-cover border border-border"
              />
            ) : (
              <Coffee className="h-6 w-6 text-primary" />
            )}
            <span className="font-display text-xl md:text-2xl font-semibold">
              {config?.adminId?.cafeName ?? "Cafe"}
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleNavClick(item.section)}
                className="text-sm font-medium hover:text-primary"
              >
                {item.label}
              </motion.button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {hasOrders && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate(`${basePath}/my-orders`)}
                className={`hidden md:flex ${location.pathname.includes("my-orders")
                  ? "text-primary"
                  : "text-foreground"
                  }`}
              >
                <ClipboardList className="h-5 w-5" />
              </motion.button>
            )}

            {/* Cart */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onCartClick}
              className="relative flex items-center justify-center"
            >
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1 text-[10px] flex items-center justify-center">
                  {itemCount}
                </Badge>
              )}
            </motion.button>

            {/* Mobile Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.section)}
                className="text-left"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => navigate(`${basePath}/my-orders`)}
              className="text-left"
            >
              My Orders
            </button>
          </div>
        )}
      </div>
    </motion.header>
  );
}