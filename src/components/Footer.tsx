import { motion } from 'framer-motion';
import { Coffee, Heart } from 'lucide-react';
import { useLayout } from '@/context/LayoutContext';

export function Footer() {
  const { config } = useLayout();

  return (
    <footer className="py-8 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2">
            {
              config?.adminId?.logo ? (
                <img src={config.adminId.logo} alt="logo" className="w-8 h-8 md:w-12 md:h-12 rounded-full object-cover border border-border" />
              ) :
                <Coffee className="h-5 w-5" />
            }
            <span className="font-display text-md font-medium">{config?.adminId?.cafeName ?? "Brew & Bean"}</span>
          </div>

          <div className="flex items-center justify-center flex-col gap-1 text-sm text-primary-foreground/80">
            <p className="text-sm text-primary-foreground/80 flex items-center gap-1">
              &copy; {new Date().getFullYear()} | {config?.adminId?.cafeName ?? "Brew & Bean"}.
            </p>
            <p>Brewing moments with care <Heart className="h-4 w-4 text-terracotta inline-block" /></p>
          </div>

          {/* <div className="flex items-center gap-4 text-sm text-primary-foreground/80">
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Privacy
            </a> |
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Terms
            </a>
          </div> */}
        </motion.div>
      </div>
    </footer>
  );
}
