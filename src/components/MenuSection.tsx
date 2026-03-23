import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MenuCard } from './MenuCard';
import { useLayout } from '@/context/LayoutContext';
import { LAYOUTS } from '@/utils/constants';
import { MenuItem } from '@/types/cafe';
import { useNavigate } from "react-router-dom";
import { Input } from './ui/input';

interface MenuSectionProps {
  showAll?: boolean;
  forceItems?: MenuItem[];
  mode?: "section" | "page";
  search?: string;
  onSearchChange?: (value: string) => void;
}

export function MenuSection({
  showAll = false,
  forceItems,
  mode = "section",
  search,
  onSearchChange,
}: MenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { layoutType, config, menuItems, categories, } = useLayout();
  const isElegant = layoutType === LAYOUTS.ELEGANT;
  const navigate = useNavigate();

  useEffect(() => {
    if (mode === "section" && !activeCategory && (categories?.length ?? 0)) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory, mode]);

  if (!(menuItems?.length ?? 0)) {
    return (
      <section id="menu" className="py-20 text-center text-muted-foreground">
        Menu not available ☕
      </section>
    );
  }

  const allItems = forceItems ?? menuItems;
  const filteredItems =
    activeCategory
      ? allItems.filter(item => item.category === activeCategory)
      : allItems;

  const visibleItems = showAll
    ? filteredItems
    : filteredItems.slice(0, 6);

  return (
    <section id="menu" className={`bg-secondary/30 ${mode === "page" ? "py-8 md:py-12" : "py-20 md:py-32"}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        {mode === "section" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-center mb-12 md:mb-16 ${isElegant ? '' : ''}`}
          >
            {isElegant ? (
              <>
                <span className="text-accent text-sm uppercase tracking-[0.3em] mb-3 block">
                  Our Selection
                </span>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium text-foreground mb-4">
                  {config?.menuTitle ?? "The Menu"}
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  "Discover our curated selection of coffee, tea, and treats"
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full mb-4">
                  <span>🍽️</span>
                  <span className="text-sm font-medium">Freshly Made</span>
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                  {config?.menuTitle ?? "The Menu"}
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  From espresso to desserts, everything made with care
                </p>
              </>
            )}
          </motion.div>
        )}


        {mode === "page" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <div className='flex flex-col gap-2'>
              <h1 className="text-3xl md:text-4xl font-display font-semibold">
                {config?.menuTitle ?? "Menu"}
              </h1>
              <p className="text-muted-foreground text-sm">
                Browse all items
              </p>
            </div>


            <div className="container mx-auto px-4 mb-10 mt-5">
              <div className="max-w-md mx-auto">
                <Input
                  placeholder="Search menu items..."
                  value={search}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10 md:mb-14"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 md:px-6 py-2 md:py-3 text-sm font-medium transition-all duration-300 ${isElegant
                ? activeCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                : activeCategory === category
                  ? 'bg-accent text-accent-foreground rounded-full'
                  : 'bg-card text-muted-foreground hover:bg-muted rounded-full'
                } ${isElegant ? 'rounded-none' : 'rounded-full'}`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Menu Grid */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`grid gap-3 md:gap-6 ${isElegant
            ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3'
            }`}
        >
          {visibleItems.map((item, index) => (
            <MenuCard key={item.id} item={item} index={index} disabled={!item.inStock} />
          ))}
        </motion.div>
      </div>
      {!showAll && (
        <div className="text-center mt-12">
          <button
            onClick={() => navigate("menu")}
            className="px-8 py-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            See Full Menu →
          </button>
        </div>
      )}
    </section>
  );
}
