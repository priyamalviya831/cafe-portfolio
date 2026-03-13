import { motion } from 'framer-motion';
import { ArrowDown, Clock, MapPin } from 'lucide-react';
import { useLayout } from '@/context/LayoutContext';
import { Button } from '@/components/ui/button';
import { LAYOUTS } from '@/utils/constants';

export function HeroSection() {
  const { layoutType, config, isLoading } = useLayout();
  const isElegant = layoutType === LAYOUTS.ELEGANT;

  if (isLoading || !config) {
    return (
      <div className="h-screen flex items-center justify-center text-lg">
        Loading cafe experience...
      </div>
    );
  }

  return (
    <>
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={config?.homeImage}
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div
            className={`absolute inset-0 ${isElegant
                ? 'bg-gradient-to-r from-foreground/90 via-foreground/70 to-transparent'
                : 'bg-foreground/70'
              }`}
          />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 pt-20">
          {isElegant ? (
            <ElegantHeroContent config={config} />
          ) : (
            <CozyHeroContent config={config} />
          )}
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary-foreground"
        >
          <ArrowDown className="h-6 w-6" />
        </motion.div>
      </section>
    </>
  );
}

function ElegantHeroContent({ config }: { config: any }) {
  return (
    <div className="max-w-2xl">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="font-display text-3xl md:text-4xl lg:text-5xl font-medium text-primary-foreground leading-[1.1] mb-6"
      >
        {config?.adminId?.cafeName ?? "Brew & Bean"}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-sm md:text-lg text-primary-foreground/80 mb-8 max-w-md font-semibold leading-relaxed"
      >
        {config?.cafeDescription ?? "Serving great coffee and warm moments every day."}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Button
          size="lg"
          className="bg-cream text-coffee hover:bg-cream-dark font-medium tracking-wide"
          onClick={() => {
            document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })
          }}
        >
          View Our Menu
        </Button>
      </motion.div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex flex-wrap gap-6 mt-12"
      >
        <div className="flex items-center gap-3 text-primary-foreground/80">
          <Clock className="h-5 w-5 text-sage-light" />
          <span className="text-sm">{config?.adminId?.hours?.weekdays ?? "Open Daily"}</span>
        </div>
        <div className="flex items-center gap-3 text-primary-foreground/80">
          <MapPin className="h-5 w-5 text-sage-light" />
          <span className="text-sm">{config?.adminId?.address ?? "Visit our cafe"}</span>
        </div>
      </motion.div>
    </div>
  );
}

function CozyHeroContent({ config }: { config: any }) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <span className="inline-block px-4 py-2 bg-primary-foreground/20 backdrop-blur-sm rounded-full text-primary-foreground text-sm">
          ☕ Welcome to Our Cozy Corner
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-primary-foreground mb-6"
      >
     {config?.adminId?.cafeName ?? "Brew & Bean"}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm md:text-lg text-primary-foreground/90 mb-10 max-w-xl mx-auto font-medium"
      >
        {config?.cafeDescription ?? "Serving great coffee and warm moments every day."}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button
          size="lg"
          className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8"
          onClick={() => {
            document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })
          }}
        >
          Explore Menu
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="hover:border-primary-foreground text-primary-foreground bg-primary-foreground/20 rounded-full px-8"
        >
          Order Now
        </Button>
      </motion.div>

      {/* Quick Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-wrap justify-center gap-8 mt-12"
      >
        <div className="flex flex-col items-center text-primary-foreground">
          <Clock className="h-6 w-6 mb-2 text-sage" />
          <span className="text-sm font-medium">Open Daily</span>
          <span className="text-xs opacity-80">{config?.adminId?.hours?.weekdays ?? "Open Daily"}</span>
        </div>
        <div className="flex flex-col items-center text-primary-foreground">
          <MapPin className="h-6 w-6 mb-2 text-sage" />
          <span className="text-sm font-medium">Visit Us</span>
          <span className="text-xs opacity-80">{config?.adminId?.address ?? "Visit our cafe"}</span>
        </div>
      </motion.div>
    </div>
  );
}
