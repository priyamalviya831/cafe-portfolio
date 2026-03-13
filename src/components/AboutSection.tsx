import { motion } from 'framer-motion';
import { useLayout } from '@/context/LayoutContext';
import { LAYOUTS } from '@/utils/constants';
import { API_ROUTES } from '@/utils/api_constant';
import { useFetch } from '@/utils/useApi';

const formatNumber = (num: number): string | number => {
  if (!num) return "";
  if (num >= 1000) return (num / 1000).toFixed(0) + "K+";
  return num;
};

export function AboutSection() {
  const { layoutType, config } = useLayout();

  const isElegant = layoutType === LAYOUTS.ELEGANT;
  const adminId = config?.adminId?._id;

  const { data, isLoading } = useFetch(
    "cafeStats",
    `${API_ROUTES.getCafeStats}/${adminId}`,
    { enabled: !!adminId }
  );

  const statsData = data?.result ?? {};

  return (
    <section id="about" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className={`grid md:grid-cols-2 gap-12 md:gap-20 items-center ${isElegant ? '' : 'md:grid-cols-[1fr,1.2fr]'
          }`}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={isElegant ? 'order-2 md:order-1' : ''}
          >
            <div className={`relative ${isElegant ? '' : 'p-4'}`}>
              <img
                src={config?.aboutImage}
                alt="Our coffee"
                className={`w-full aspect-square object-cover ${isElegant ? 'rounded-none' : 'rounded-3xl'
                  }`}
              />
              {/* {isElegant && (
                <div className="absolute -bottom-6 -right-6 bg-accent text-accent-foreground p-6 max-w-[200px]">
                  <span className="font-display text-4xl font-medium block">15+</span>
                  <span className="text-sm">Years of Excellence</span>
                </div>
              )} */}
              {!isElegant && (
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className="absolute -bottom-4 -right-4 bg-accent text-accent-foreground p-4 rounded-2xl shadow-medium"
                >
                  <span className="font-display text-3xl font-bold block">☕</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={isElegant ? 'order-1 md:order-2' : ''}
          >
            {isElegant ? (
              <>
                <span className="text-accent text-sm uppercase tracking-[0.3em] mb-3 block">
                  {config?.aboutTitle ?? 'About Us'}
                </span>
                <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground mb-6">
                  Passion in Every Cup
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    {config?.aboutDescription ??
                      "At our cafe, we're more than just a place to grab a coffee. We're a community hub where every cup tells a story. Our passion for quality meets our love for creating warm, welcoming spaces where friendships bloom and ideas percolate."}
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-8">
                  {statsData?.totalCustomer > 0 && (
                    <div>
                      <span className="font-display text-3xl font-medium text-primary block">
                        {formatNumber(statsData?.totalCustomer)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Happy Customers
                      </span>
                    </div>
                  )}

                  {statsData?.totalMenuItem > 0 && (
                    <div>
                      <span className="font-display text-3xl font-medium text-primary block">
                        {formatNumber(statsData?.totalMenuItem)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Menu Items
                      </span>
                    </div>
                  )}

                  {statsData?.averageRating > 0 && (
                    <div>
                      <span className="font-display text-3xl font-medium text-primary block">
                        {statsData?.averageRating}★
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Rating
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                  <span>✨</span>
                  <span className="text-sm font-medium">{config?.aboutTitle ?? 'About Us'}</span>
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  More Than Just Coffee
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {config?.aboutDescription ??
                    "Our cafe is a blend of passion, community, and exceptional coffee. We believe in creating more than just great drinks – we create a space where people can connect, relax, and enjoy life's simple pleasures."}
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-card px-4 py-3 rounded-xl">
                    <span className="text-2xl">🌱</span>
                    <div>
                      <span className="font-medium text-foreground block">Organic</span>
                      <span className="text-xs text-muted-foreground">100% organic beans</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-card px-4 py-3 rounded-xl">
                    <span className="text-2xl">🤝</span>
                    <div>
                      <span className="font-medium text-foreground block">Fair Trade</span>
                      <span className="text-xs text-muted-foreground">Ethically sourced</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-card px-4 py-3 rounded-xl">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <span className="font-medium text-foreground block">Award Winning</span>
                      <span className="text-xs text-muted-foreground">Best local cafe 2024</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
