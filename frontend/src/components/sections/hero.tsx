"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Chick, type ChickPhase } from "@/components/brand/chick";

const FLOCK: { delay: number; scale: number; flip?: boolean }[] = [
  { delay: 0, scale: 0.9 },
  { delay: 0.15, scale: 1.15 },
  { delay: 0.3, scale: 0.85, flip: true },
  { delay: 0.1, scale: 1, flip: true },
  { delay: 0.25, scale: 0.95 },
];

export function Hero() {
  const [phase, setPhase] = useState<ChickPhase>("peck");

  useEffect(() => {
    const t = setTimeout(() => setPhase("look"), 3200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section id="top" className="pt-16 pb-10 px-6 md:px-10 lg:px-16 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto">
        <span className="inline-block text-xs md:text-sm font-bold tracking-wide uppercase bg-foreground text-background px-3 py-1 rounded-full">
          Farm to table, one link at a time
        </span>
        <h1 className="font-head font-extrabold text-4xl sm:text-5xl md:text-6xl mt-5 leading-[1.05]">
          Connecting Nigeria&rsquo;s
          <br />
          poultry ecosystem.
        </h1>
        <p className="font-body text-base md:text-lg text-muted-foreground mt-5 max-w-xl mx-auto">
          PoultryLink brings farmers, buyers, suppliers, transporters, vets and cooperatives
          into one trusted marketplace — from listing to doorstep.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={phase === "look" ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild size="lg">
            <Link href="/marketplace">Explore PoultryLink</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/register">Get Started</Link>
          </Button>
        </motion.div>

        <p className="text-xs text-muted-foreground mt-3">
          <Link href="/login" className="underline hover:no-underline">
            Log in
          </Link>{" "}
          ·{" "}
          <Link href="/register" className="underline hover:no-underline">
            Create account
          </Link>
        </p>
      </div>

      <div className="flex justify-center items-end gap-4 md:gap-8 mt-12 h-24">
        {FLOCK.map((c, i) => (
          <Chick key={i} phase={phase} delay={c.delay} scale={c.scale} flip={c.flip} />
        ))}
      </div>
      <div className="link-dash w-24 mx-auto mt-6 opacity-40" />
    </section>
  );
}