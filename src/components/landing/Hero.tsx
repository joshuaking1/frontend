// src/components/landing/Hero.tsx
"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from 'next/link';
import Lottie from "lottie-react";
import animationData from "../../../public/animation.json";

export const Hero = () => {
  return (
    <section className="bg-white py-20 md:py-32">
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left Side: Headline & CTA */}
        <div className="space-y-6 text-center md:text-left">
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-brand-blue leading-tight">
            Stop Drowning in SBC Paperwork.
            <br />
            <span className="text-brand-orange">Start Inspiring Students.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-lg mx-auto md:mx-0">
            LearnBridgeEdu is the all-in-one AI platform for Ghanaian teachers
            and students. Generate lesson plans, create assessments, and master
            the SBC curriculum in minutes, not weekends.
          </p>
          <div className="flex justify-center md:justify-start space-x-4 pt-4">
            <Link href="/auth/sign-up" passHref>
              <Button
                size="lg"
                className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-8 py-6 text-lg"
              >
                Start For Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 py-6 text-lg"
            >
              Request a Demo
            </Button>
          </div>
          <div className="flex space-x-6 pt-4 justify-center md:justify-start">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-slate-600">No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-slate-600">Free forever plan</span>
            </div>
          </div>
        </div>

        {/* Right Side: Visual (Lottie Animation) */}
        <div className="flex items-center justify-center">
            <Lottie
                animationData={animationData}
                className="w-full max-w-lg"
                loop={true}
            />
        </div>
      </div>
    </section>
  );
};
