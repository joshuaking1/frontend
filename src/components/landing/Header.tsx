// src/components/landing/Header.tsx
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from 'next/link';

export const Header = () => {
  return (
    <header className="p-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          {/* You will need to add a logo image in your public folder */}
          {/* <Image src="/logo.svg" alt="LearnBridgeEdu Logo" width={40} height={40} /> */}
          <span className="font-serif text-2xl font-bold text-brand-blue">
            LearnBridgeEdu
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-6 items-center">
          <a
            href="#features"
            className="text-slate-600 hover:text-brand-orange transition-colors"
          >
            Features
          </a>
          <a
            href="#for-teachers"
            className="text-slate-600 hover:text-brand-orange transition-colors"
          >
            For Teachers
          </a>
          <a
            href="#for-students"
            className="text-slate-600 hover:text-brand-orange transition-colors"
          >
            For Students
          </a>
          <a
            href="#pricing"
            className="text-slate-600 hover:text-brand-orange transition-colors"
          >
            Pricing
          </a>
        </nav>

        {/* CTA Button */}
        <Link href="/auth/sign-up" passHref>
          <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-6">
            Get Started Free
          </Button>
        </Link>
      </div>
    </header>
  );
};
