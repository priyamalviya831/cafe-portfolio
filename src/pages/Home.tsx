import { HeroSection } from "@/components/HeroSection";
import { MenuSection } from "@/components/MenuSection";
import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { FeedbackTestimonials } from "@/components/FeedbackTestimonials";

export function Home() {
  return (
    <>
      <HeroSection />
      <MenuSection />
      <AboutSection />
      <FeedbackTestimonials />
      <ContactSection />
    </>
  );
}