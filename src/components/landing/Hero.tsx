// src/components/landing/Hero.tsx
"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import Lottie from "lottie-react";
import animationData from "../../../public/animation.json";

export const Hero = () => {
  return (
    <section className="bg-white py-12 sm:py-16 md:py-24 lg:py-32 px-4">
      <div className="container mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Left Side: Headline & CTA */}
        <div className="space-y-4 sm:space-y-6 text-center md:text-left order-2 md:order-1">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-brand-blue leading-tight">
            Stop Drowning in SBC Paperwork.
            <br />
            <span className="text-brand-orange">Start Inspiring Students.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-lg mx-auto md:mx-0">
            LearnBridgeEdu is the all-in-one AI platform for Ghanaian teachers
            and students. Generate lesson plans, create assessments, and master
            the SBC curriculum in minutes, not weekends.
          </p>

          {/* Mobile-first button layout */}
          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3 sm:gap-4 pt-4">
            <Link href="/auth/sign-up" passHref>
              <Button
                size="lg"
                className="w-full sm:w-auto bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
              >
                Start For Free{" "}
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto rounded-full px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
            >
              Request a Demo
            </Button>
          </div>

          {/* Mobile-optimized feature list */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 pt-4 justify-center md:justify-start">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
              <span className="text-sm sm:text-base text-slate-600">
                No credit card required
              </span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
              <span className="text-sm sm:text-base text-slate-600">
                Free forever plan
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Visual (Lottie Animation) */}
        <div className="flex items-center justify-center order-1 md:order-2">
          <Lottie
            animationData={animationData}
            className="w-full max-w-sm sm:max-w-md md:max-w-lg"
            loop={true}
          />
        </div>
      </div>
    </section>
  );
};
