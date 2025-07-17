// src/components/ui/animated-card.tsx
"use client";

import { motion } from "framer-motion";
import { Card, CardProps } from "@/components/ui/card"; // Import Card and its props
import { cn } from "@/lib/utils"; // Import your utility for class names

// Extend the CardProps to include our wrapper's props
interface AnimatedCardProps extends CardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Add an optional delay for staggered animations
}

export const AnimatedCard = ({
  children,
  className,
  delay = 0,
  ...props
}: AnimatedCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
    >
      {/* Pass all original Card props down to the Card component */}
      <Card className={cn("h-full", className)} {...props}>
        {children}
      </Card>
    </motion.div>
  );
};
