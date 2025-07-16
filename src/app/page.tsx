// src/app/page.tsx
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Solution } from "@/components/landing/Solution";
import { FeaturesForTeachers } from "@/components/landing/FeaturesForTeachers";
import { FeaturesForStudents } from "@/components/landing/FeaturesForStudents";
import { Gamification } from "@/components/landing/Gamification";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="bg-white">
      <Header />
      <Hero />
      <Problem />
      <Solution />
      <FeaturesForTeachers />
      <FeaturesForStudents />
      <Gamification />
      <Pricing />
      <Footer />
    </main>
  );
}
