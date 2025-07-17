// src/app/page.tsx
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { TrustedBy } from "@/components/landing/TrustedBy"; // Import new
import { Problem } from "@/components/landing/Problem";
import { Solution } from "@/components/landing/Solution";
import { FeaturesForTeachers } from "@/components/landing/FeaturesForTeachers";
import { FeaturesForStudents } from "@/components/landing/FeaturesForStudents";
import { Gamification } from "@/components/landing/Gamification";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { AnimatedSection } from "@/components/landing/AnimatedSection"; // Import new

export default function Home() {
  return (
    <main className="bg-white">
      <Header />
      <Hero />

      <AnimatedSection>
        <TrustedBy />
      </AnimatedSection>

      <AnimatedSection>
        <Problem />
      </AnimatedSection>

      <AnimatedSection>
        <Solution />
      </AnimatedSection>

      <AnimatedSection>
        <FeaturesForTeachers />
      </AnimatedSection>

      <AnimatedSection>
        <FeaturesForStudents />
      </AnimatedSection>

      <AnimatedSection>
        <Gamification />
      </AnimatedSection>

      <AnimatedSection>
        <Testimonials />
      </AnimatedSection>

      <AnimatedSection>
        <Pricing />
      </AnimatedSection>

      <AnimatedSection>
        <FinalCTA />
      </AnimatedSection>

      <Footer />
    </main>
  );
}
