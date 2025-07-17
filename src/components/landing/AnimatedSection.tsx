// src/components/landing/AnimatedSection.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type AnimatedSectionProps = {
  children: React.ReactNode;
  className?: string;
};

export const AnimatedSection = ({
  children,
  className,
}: AnimatedSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 }); // Trigger once, when 20% is visible

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.section
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
};
