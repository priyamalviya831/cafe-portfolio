
// import { CartProvider } from '@/context/CartContext';
// import { Header } from '@/components/Header';
// import { HeroSection } from '@/components/HeroSection';
// import { MenuSection } from '@/components/MenuSection';
// import { AboutSection } from '@/components/AboutSection';
// import { ContactSection } from '@/components/ContactSection';
// import { Footer } from '@/components/Footer';
// import { CartDrawer } from '@/components/CartDrawer';
// import { useEffect, useState } from "react";
// import LoginPopup from "@/components/LoginPopup";
// import { useAuth } from "@/context/AuthContext";
// import { useCart } from '@/context/CartContext';
// import { motion, AnimatePresence } from "framer-motion";
// // import { useLocation } from "react-router-dom";

// import { Outlet, useLocation } from "react-router-dom";
// import { useLayout } from '@/context/LayoutContext';

// const Index = () => {
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const { setUser, setIsAuthenticated } = useAuth();
//   const { itemCount, total } = useCart();
//   const { config } = useLayout();

//   const [showLogin, setShowLogin] = useState(false);
//   const location = useLocation();

//   useEffect(() => {
//     if (location.state?.scrollTo) {
//       setTimeout(() => {
//         document
//           .getElementById(location.state.scrollTo)
//           ?.scrollIntoView({ behavior: "smooth" });
//       }, 200);
//     }
//   }, [location]);

//   return (
//     <CartProvider>
//       <div className="min-h-screen flex flex-col bg-background">
//         <LoginPopup open={showLogin} onClose={() => setShowLogin(false)} />
//         <Header onCartClick={() => setIsCartOpen(true)} />
//         <main className="flex-1 overflow-hidden">
//           <Outlet />
//         </main>
//         <Footer />
//         <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
//       </div>

//       <AnimatePresence>
//         {itemCount > 0 && (
//           <motion.div
//             initial={{ y: 100, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: 100, opacity: 0 }}
//             transition={{ type: "spring", stiffness: 260, damping: 20 }}
//             className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
//           >
//             <button
//               onClick={() => setIsCartOpen(true)}
//               className="w-full bg-accent text-accent-foreground py-4 rounded-xl shadow-xl font-semibold flex justify-between items-center px-6"
//             >
//               <span>🛒 {itemCount} Items</span>
//               <span>₹{total.toFixed(0)}</span>
//             </button>
//           </motion.div>
//         )}
//       </AnimatePresence>

//     </CartProvider>
//   );
// };

// export default Index;

import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { useEffect, useState } from "react";
import LoginPopup from "@/components/LoginPopup";
import { useAuth } from "@/context/AuthContext";
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import { useLayout } from '@/context/LayoutContext';


/* ✅ This component CAN use useCart */
const LayoutContent = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { itemCount, total } = useCart(); // ✅ SAFE HERE
  const { config } = useLayout();
  const { setUser, setIsAuthenticated } = useAuth();

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LoginPopup open={showLogin} onClose={() => setShowLogin(false)} />

      <Header onCartClick={() => setIsCartOpen(true)} />

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      <Footer />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* 🔥 SLIDE UP CART BUTTON */}
      <AnimatePresence>
        {itemCount > 0 && !isCartOpen && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="fixed bottom-6 inset-x-0 flex justify-center z-50"
          >
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-accent text-accent-foreground px-6 py-3 rounded-full shadow-2xl font-medium flex items-center gap-4 hover:scale-105 transition-all duration-300"
            >
              {/* 🛒 {itemCount} • ₹{total.toFixed(0)} */}
              🛒 {itemCount} • Go to Cart
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


/* ✅ Provider wraps everything */
const Index = () => {
  return (
    <CartProvider>
      <LayoutContent />
    </CartProvider>
  );
};

export default Index;
