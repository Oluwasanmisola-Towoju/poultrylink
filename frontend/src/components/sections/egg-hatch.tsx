"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import eggHatch from "../../../images/egg_hatch.png";

export function EggHatch() {
  const frameRef = useRef<HTMLDivElement>(null);
  const inView = useInView(frameRef, { amount: 0.5, once: true });
  const reduceMotion = useReducedMotion();

  // 0 = only the bottom half of the shell is visible, 1 = the whole picture.
  // The mask edge is feathered so there's never a hard seam while it opens up.
  const progress = useMotionValue(0);
  const mask = useTransform(progress, (p) => {
    const edge = 38 + p * 72; // % measured from the bottom of the frame
    return `linear-gradient(to top, #000 ${edge - 8}%, transparent ${edge}%)`;
  });

  useEffect(() => {
    if (reduceMotion) {
      progress.set(1);
      return;
    }
    if (!inView) return;
    const controls = animate(progress, 1, { delay: 0.9, duration: 0.7, ease: "easeOut" });
    return () => controls.stop();
  }, [inView, reduceMotion, progress]);

  return (
    <section className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h2 className="mb-8 font-head text-3xl font-extrabold md:text-4xl">Every great order starts small</h2>

      {/* Frame colour matches the illustration's paper tone, so it reads as a framed print. */}
      <div
        ref={frameRef}
        className="pixel-shadow relative mx-auto aspect-[3/2] w-full overflow-hidden rounded-3xl border-2 border-foreground bg-[#EAD99D]"
      >
        <motion.div
          className="absolute inset-0 origin-[50%_92%]"
          style={{ maskImage: mask, WebkitMaskImage: mask }}
          animate={
            inView && !reduceMotion
              ? {
                  rotate: [0, -2.5, 2.5, -2.5, 2.5, 0, 0, 0],
                  y: [0, 0, 0, 0, 0, 0, -18, 0],
                }
              : undefined
          }
          transition={{ duration: 1.7, times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.75, 1], ease: "easeInOut" }}
        >
          <Image
            src={eggHatch}
            alt="A pixel-art chick in sunglasses and sneakers hopping out of a cracked egg"
            fill
            placeholder="blur"
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </motion.div>
      </div>

      <p className="mx-auto mt-6 max-w-md text-muted-foreground">
        From a single listing to a delivered order — PoultryLink hatches trust into every transaction.
      </p>
    </section>
  );
}