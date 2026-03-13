import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import { useFetch } from "@/utils/useApi";
import {API_ROUTES} from "@/utils/api_constant";
import { useLayout } from "@/context/LayoutContext";
import { LAYOUTS } from "@/utils/constants";

type Testimonial = {
    _id: string;
    customerId: {
        name: string;
        phoneNumber: string;
    };
    description: string;
    rate: number;
};

export function FeedbackTestimonials() {
    const { config, layoutType } = useLayout();
    const isElegant = layoutType === LAYOUTS.ELEGANT;

    const adminId = config?.adminId?._id;

    const { data } = useFetch(
        "topFeedback",
         `${API_ROUTES.topFeedback}/${adminId}`,
         { enabled: !!adminId }
    );

    const testimonials = (data?.result as Testimonial[]) ?? [];
    if (!testimonials.length) return null;

    return (
        <section className="pt-1 pb-16 md:pt-14 md:pb-20 bg-background">
            <div className="container mx-auto px-4">

                <div>
                    <h2 className={`text-center font-display text-4xl md:text-5xl ${isElegant ? "mb-10" : "mb-3"}`}>
                        {isElegant ? "What Our Customers Say ⭐" : "Wall of Love ❤️"}
                    </h2>
                    {!isElegant && (
                        <p className="text-center text-muted-foreground mb-12">
                            Real stories from our happy customers
                        </p>
                    )}
                </div>

                <div className="relative">

                    <button className="testimonial-prev absolute -left-4 md:-left-6 lg:-left-14 top-[40%] md:top-[40%] -translate-y-1/2 z-10 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100">
                        ‹
                    </button>

                    <button className="testimonial-next absolute -right-4 md:-right-6 lg:-right-14 top-[40%] md:top-[40%] -translate-y-1/2 z-10 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100">
                        ›
                    </button>

                    <Swiper
                        modules={[Navigation, Autoplay]}
                        slidesPerView={1}
                        spaceBetween={30}
                        loop
                        autoplay={{ delay: 3500, disableOnInteraction: false }}
                        navigation={{
                            prevEl: ".testimonial-prev",
                            nextEl: ".testimonial-next",
                        }}
                        breakpoints={{
                            640: { slidesPerView: 1 },
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                        className="pb-12"
                    >

                        {testimonials.map((item, index) => (
                            <SwiperSlide key={item._id} className="pt-6">

                                {isElegant ? (
                                    /* ---------------- ELEGANT STYLE ---------------- */
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="relative bg-card border border-border p-8 rounded-xl shadow-sm hover:shadow-md transition"
                                    >

                                        <Quote className="absolute top-6 right-6 text-accent opacity-40" />

                                        <p className="text-muted-foreground leading-relaxed mb-6">
                                            {item.description}
                                        </p>

                                        <div className="flex items-center justify-between">

                                            <div className="flex items-center gap-3">

                                                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                                                    {item.customerId?.name?.charAt(0)}
                                                </div>

                                                <span className="font-medium text-foreground">
                                                    {item.customerId?.name ?? "Guest"}
                                                </span>

                                            </div>

                                            <div className="flex gap-1 text-yellow-500 text-sm">
                                                {Array.from({ length: item.rate}).map((_, i) => (
                                                    <span key={i}>★</span>
                                                ))}
                                            </div>

                                        </div>
                                    </motion.div>
                                ) : (
                                    /* ---------------- COZY STYLE ---------------- */
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="relative bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition"
                                    >

                                        {/* Name Ribbon */}
                                        <div className="absolute -top-5 left-6 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium shadow">
                                            {item.customerId?.name}
                                        </div>

                                        {/* Stars */}
                                        <div className="flex gap-1 text-yellow-500 mt-4 mb-3">
                                            {Array.from({ length: item.rate }).map((_, i) => (
                                                <span key={i}>⭐</span>
                                            ))}
                                        </div>

                                        {/* Review */}
                                        <p className="text-muted-foreground text-sm leading-relaxed border-l-4 border-accent pl-4">
                                            {item.description}
                                        </p>

                                    </motion.div>
                                )}

                            </SwiperSlide>
                        ))}

                    </Swiper>
                </div>
            </div>
        </section>
    );
}