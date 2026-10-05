"use client";

import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import headphoneChicken from "../../../images/chicken-on-headphone.jpg";
import mustacheChicken from "../../../images/chicken-on-mustache.jpg";
import bandanaChicken from "../../../images/chicken-on-bandana.jpg";
import glassesChicken from "../../../images/chicken-on-glasses.png";

const CREW: { src: StaticImageData; alt: string }[] = [
  { src: headphoneChicken, alt: "Pixel-art chicken wearing a headset" },
  { src: bandanaChicken, alt: "Pixel-art chicken wearing a bandana and gold chain" },
  { src: mustacheChicken, alt: "Pixel-art chicken wearing a beret, moustache and sunglasses" },
  { src: glassesChicken, alt: "Pixel-art chicken wearing sunglasses with a cigar" },
];

export function Hero() {
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
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
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

      <div className="flex justify-center items-end gap-4 md:gap-6 mt-12">
        {CREW.map((c, i) => (
          <motion.div
            key={c.alt}
            initial={{ opacity: 0, y: 24, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.12, ease: "backOut" }}
            className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-foreground pixel-shadow shrink-0"
          >
            <Image src={c.src} alt={c.alt} fill placeholder="blur" sizes="112px" className="object-cover" />
          </motion.div>
        ))}
      </div>
      <div className="link-dash w-24 mx-auto mt-6 opacity-40" />
    </section>
  );
}