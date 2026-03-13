import { motion } from "framer-motion";
import { Minus, Plus, Star, Sparkles } from "lucide-react";
import { MenuItem } from "@/types/cafe";
import { useCart } from "@/context/CartContext";
import { useLayout } from "@/context/LayoutContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import fallbackImage from "@/assets/coffee-art.jpg";
import toast from "react-hot-toast";
import { LAYOUTS } from "@/utils/constants";

interface MenuCardProps {
  item: MenuItem;
  index: number;
}

export function MenuCard({ item, index }: MenuCardProps) {
  const { addItem, items, updateQuantity } = useCart();
  const { layoutType } = useLayout();
  const isElegant = layoutType === LAYOUTS.ELEGANT;

  const image = item.image ?? fallbackImage;
  const cartItem = items.find((i) => i.id === item.id);


  if (isElegant) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -8 }}
        className="group relative bg-card rounded-lg overflow-hidden shadow-card card-hover"
      >
        <div className="relative h-28 md:h-48 lg:h-56 overflow-hidden">
          <img
            src={image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {item.isPopular && (
              <Badge className="bg-accent text-accent-foreground gap-1">
                <Star className="h-3 w-3" /> Popular
              </Badge>
            )}
            {item.isNew && (
              <Badge className="bg-terracotta text-primary-foreground gap-1">
                <Sparkles className="h-3 w-3" /> New
              </Badge>
            )}
          </div>
        </div>

        <div className="p-2 md:p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-display text-sm md:text-lg font-medium text-foreground line-clamp-1">
              {item.name}
            </h3>

            <div className="text-right">
              <span className="text-primary font-semibold block">
                ₹{item.discountPrice.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ₹{item.price.toFixed(2)}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 h-10">
            {item.description ?? "Delicious item from our menu."}
          </p>
          <div className="justify-center flex m-2">
            {!cartItem ? (
              <Button
                variant="outline"
                className="h-7 px-8 py-4 text-md rounded-full"
                onClick={() => {
                  addItem(item);
                  toast.success("Item added to cart.");
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() =>
                    updateQuantity(item.id, cartItem.quantity - 1)
                  }
                >
                  <Minus className="h-3 w-3" />
                </Button>

                <span className="font-medium w-4 text-center">
                  {cartItem.quantity}
                </span>

                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() =>
                    updateQuantity(item.id, cartItem.quantity + 1)
                  }
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}

          </div>
        </div>
      </motion.div>
    );
  }

  // Cozy Layout
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group flex gap-2 p-2 sm:gap-3 sm:p-3 md:p-4 bg-card rounded-xl md:rounded-2xl shadow-card transition-all duration-300"
    >

      <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 flex-shrink-0 rounded-lg md:rounded-xl overflow-hidden">
        <img
          src={image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {(item.isPopular || item.isNew) && (
          <div className="absolute top-1 left-1">
            {item.isPopular && (
              <span className="flex items-center justify-center w-5 h-5 bg-accent rounded-full">
                <Star className="h-3 w-3 text-accent-foreground" />
              </span>
            )}
            {item.isNew && (
              <span className="flex items-center justify-center w-5 h-5 bg-terracotta rounded-full">
                <Sparkles className="h-3 w-3 text-primary-foreground" />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
          <h3 className="font-display text-sm  md:text-base font-medium text-foreground truncate">
            {item.name}
          </h3>

          <div className="text-left sm:text-right mt-1 sm:mt-0">
            <span className="text-accent font-bold block">
              ₹{item.discountPrice.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground line-through">
              ₹{item.price.toFixed(2)}
            </span>
          </div>
        </div>
        <p className="hidden md:block text-sm text-muted-foreground line-clamp-2 mb-2 h-9">
          {item.description ?? "Delicious item from our menu."}
        </p>

        {!cartItem ? (
          <Button
            variant="outline"
            className="h-7 px-4 md:px-8 py-4 text-md rounded-full mt-2"
            onClick={() => {
              addItem(item);
              toast.success("Item added to cart.");
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        ) : (
          <div className="flex items-center gap-3 mt-4">
            <Button
              size="icon"
              variant="outline"
              className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
              onClick={() =>
                updateQuantity(item.id, cartItem.quantity - 1)
              }
            >
              <Minus className="h-3 w-3" />
            </Button>

            <span className="text-sm font-medium w-4 text-center">
              {cartItem.quantity}
            </span>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={() =>
                updateQuantity(item.id, cartItem.quantity + 1)
              }
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}

      </div>
    </motion.div>
  );
}
