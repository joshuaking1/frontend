// src/app/page.tsx
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Solution } from "@/components/landing/Solution";
import { FeaturesForTeachers } from "@/components/landing/FeaturesForTeachers";
import { FeaturesForStudents } from "@/components/landing/FeaturesForStudents";
import { Gamification } from "@/components/landing/Gamification";
import { Testimonials } from "@/components/landing/Testimonials"; // Import new
import { Pricing } from "@/components/landing/Pricing";
import { FinalCTA } from "@/components/landing/FinalCTA"; // Import new
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="bg-white">
      <Header />
      <Hero />
      {/* We can add a "Trusted By" logo strip here later */}
      <Problem />
      <Solution />
      <FeaturesForTeachers />
      <FeaturesForStudents />
      <Gamification />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  );
}
