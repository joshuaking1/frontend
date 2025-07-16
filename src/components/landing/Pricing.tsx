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
    <section id="pricing" className="py-20 md:py-24 bg-slate-100">
      <div className="container mx-auto">
        <div className="text-center">
          <h2 className="font-serif text-4xl font-bold text-brand-blue">
            A Plan for Every Ambition
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
            Choose the plan that fits your needs. Simple, transparent pricing to
            fuel your growth.
          </p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-8 items-center">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`flex flex-col ${
                tier.isFeatured
                  ? "border-brand-orange ring-2 ring-brand-orange shadow-lg"
                  : "bg-white"
              }`}
            >
              <CardHeader className="text-center">
                <CardTitle className="font-serif text-3xl text-brand-blue">
                  {tier.name}
                </CardTitle>
                <CardDescription className="pt-2">
                  {tier.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-center">
                  <span className="font-bold text-5xl text-brand-blue">
                    {tier.price}
                  </span>
                  <span className="text-slate-500">{tier.period}</span>
                </p>
                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={`w-full text-lg py-6 rounded-lg ${
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
        <p className="text-center mt-8 text-slate-500">
          Student and Family plans are available after signing up.
        </p>
      </div>
    </section>
  );
};
