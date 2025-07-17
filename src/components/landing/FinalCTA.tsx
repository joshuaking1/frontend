// src/components/landing/FinalCTA.tsx
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const FinalCTA = () => {
    return (
        <section className="py-20 md:py-32 bg-brand-blue">
            <div className="container mx-auto text-center text-white">
                <h2 className="font-serif text-4xl md:text-5xl font-bold">Join the Educational Revolution in Ghana</h2>
                <p className="mt-6 text-lg max-w-3xl mx-auto text-slate-300">
                    Stop planning, start inspiring. Stop struggling, start understanding.
                    Unlock the power of AI and build the future of education today. Your free account is just one click away.
                </p>
                <div className="mt-10">
                     <Link href="/auth/sign-up" passHref>
                        <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-10 py-8 text-xl font-bold">
                            Get Started For Free <ArrowRight className="ml-2 h-6 w-6" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}