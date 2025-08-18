// src/components/landing/Header.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#for-teachers", label: "For Teachers" },
    { href: "#for-students", label: "For Students" },
    { href: "#pricing", label: "Pricing" },
  ];

  return (
    <header className="px-4 py-3 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image
            src="/LearnBridge-logo-inverted-croped.png"
            alt="LearnBridge"
            width={180}
            height={50}
            className="h-auto w-auto max-w-[180px]"
            priority
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 items-center">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-slate-600 hover:text-brand-orange transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA Button */}
        <div className="hidden md:block">
          <Link href="/auth/sign-up" passHref>
            <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-6">
              Get Started Free
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <Image
                  src="/LearnBridge-logo-inverted-croped.png"
                  alt="LearnBridge"
                  width={150}
                  height={40}
                  className="h-auto w-auto max-w-[150px]"
                  priority
                />
              </div>

              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-slate-600 hover:text-brand-orange transition-colors text-lg py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              <div className="pt-4 border-t">
                <Link href="/auth/sign-up" passHref>
                  <Button
                    className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full py-3"
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
