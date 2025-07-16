// src/components/landing/Hero.tsx
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from 'next/link';

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

        {/* Right Side: Visual (App Mockup) */}
        <div className="p-4 bg-slate-100 rounded-2xl shadow-lg">
          {/* Placeholder for a beautiful app mockup image or Lottie animation */}
          {/* Recommendation: Create a graphic showing the app on a laptop and phone */}
          <div className="aspect-video bg-slate-300 rounded-lg flex items-center justify-center">
            <p className="font-serif text-slate-500">App Mockup Visual Here</p>
          </div>
        </div>
      </div>
    </section>
  );
};
