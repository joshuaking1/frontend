// src/components/landing/Pricing.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Basic Teacher",
    price: "GHS 0",
    period: "/ month",
    description: "For every teacher to get started with the power of AI.",
    features: [
      "AI Lesson Planner (5/month)",
      "Basic Assessment Builder",
      "Access to Resource Hub",
      "PLC Community Access",
    ],
    cta: "Start for Free",
    isFeatured: false,
  },
  {
    name: "Premium Teacher",
    price: "GHS 49",
    period: "/ month",
    description: "The ultimate toolkit to become a super-teacher.",
    features: [
      "Unlimited AI Lesson Plans",
      "AI Co-Teacher Workshop",
      "Advanced Assessment Generator",
      "Monetize Your Resources",
      "AI-Powered PD Coach",
      "Full Gamification Access",
    ],
    cta: "Go Premium",
    isFeatured: true,
  },
  {
    name: "School Plan",
    price: "Custom",
    period: "",
    description: "Equip your entire institution with LearnBridgeEdu.",
    features: [
      "Everything in Premium",
      "School-wide Admin Dashboard",
      "Student Performance Analytics",
      "Private School Zones",
      "Dedicated Support",
    ],
    cta: "Contact Sales",
    isFeatured: false,
  },
];

export const Pricing = () => {
  return (
    <section
      id="pricing"
      className="py-12 sm:py-16 md:py-20 lg:py-24 bg-slate-100 px-4"
    >
      <div className="container mx-auto">
        <div className="text-center">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-brand-blue">
            A Plan for Every Ambition
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto px-4">
            Choose the plan that fits your needs. Simple, transparent pricing to
            fuel your growth.
          </p>
        </div>
        <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`flex flex-col h-full ${
                tier.isFeatured
                  ? "border-brand-orange ring-2 ring-brand-orange shadow-lg md:scale-105"
                  : "bg-white shadow-md hover:shadow-lg transition-shadow"
              }`}
            >
              <CardHeader className="text-center pb-4">
                <CardTitle className="font-serif text-xl sm:text-2xl md:text-3xl text-brand-blue">
                  {tier.name}
                </CardTitle>
                <CardDescription className="pt-2 text-sm sm:text-base">
                  {tier.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-center mb-6">
                  <span className="font-bold text-3xl sm:text-4xl md:text-5xl text-brand-blue">
                    {tier.price}
                  </span>
                  <span className="text-slate-500 text-sm sm:text-base">
                    {tier.period}
                  </span>
                </div>
                <ul className="space-y-2 sm:space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600 text-sm sm:text-base leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-4">
                <Button
                  className={`w-full text-base sm:text-lg py-4 sm:py-6 rounded-lg transition-colors ${
                    tier.isFeatured
                      ? "bg-brand-orange hover:bg-brand-orange/90"
                      : "bg-brand-blue hover:bg-brand-blue/90"
                  } text-white`}
                >
                  {tier.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <p className="text-center mt-6 sm:mt-8 text-slate-500 text-sm sm:text-base px-4">
          Student and Family plans are available after signing up.
        </p>
      </div>
    </section>
  );
};
