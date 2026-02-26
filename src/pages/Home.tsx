import { HeroSection } from "@/components/HeroSection";
import { MenuSection } from "@/components/MenuSection";
import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <MenuSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}