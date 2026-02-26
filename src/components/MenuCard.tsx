import { motion } from "framer-motion";
import { Minus, Plus, Star, Sparkles } from "lucide-react";
import { MenuItem } from "@/types/cafe";
import { useCart } from "@/context/CartContext";
import { useLayout } from "@/context/LayoutContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import fallbackImage from "@/assets/coffee-art.jpg";
import pastry from "@/assets/pastry.jpg";
import breakfast from "@/assets/breakfast.jpg";
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

  const image = item.image || fallbackImage;
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
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
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

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-display text-lg font-medium text-foreground">
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
            {item.description}
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
      className="group flex gap-4 p-4 bg-card rounded-2xl shadow-card hover:shadow-medium transition-all duration-300"
    >
      {/* Image */}
      <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
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
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-display text-base font-medium text-foreground truncate">
            {item.name}
          </h3>
          {/* <span className="text-accent font-bold ml-2">
            ₹{item.price.toFixed(2)}
          </span> */}

          <div className="text-right">
            <span className="text-accent font-bold block">
              ₹{item.discountPrice.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground line-through">
              ₹{item.price.toFixed(2)}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2 h-9">
          {item.description}
        </p>

        {!cartItem ? (
          <Button
            variant="outline"
            className="h-7 px-8 py-4 text-md rounded-full mt-2"
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
    </motion.div>
  );
}
