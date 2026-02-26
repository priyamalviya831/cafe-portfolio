
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { MenuSection } from '@/components/MenuSection';
import { AboutSection } from '@/components/AboutSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { useEffect, useState } from "react";
import LoginPopup from "@/components/LoginPopup";
import { useAuth } from "@/context/AuthContext";
// import { useLocation } from "react-router-dom";

import { Outlet, useLocation } from "react-router-dom";
import { useLayout } from '@/context/LayoutContext';

const Index = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { setUser, setIsAuthenticated } = useAuth();

  const { config } = useLayout();

  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      setTimeout(() => {
        document
          .getElementById(location.state.scrollTo)
          ?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  }, [location]);

  useEffect(() => {
    const adminId = config?.adminId?._id;
    if (!adminId) return;

    const storedUser = localStorage.getItem(`cafe_user_${adminId}`);

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [config?.adminId?._id]);

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <LoginPopup open={showLogin} onClose={() => setShowLogin(false)} />
        <Header onCartClick={() => setIsCartOpen(true)} />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
        <Footer />
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    </CartProvider>
  );
};

export default Index;
