"use client";

import { motion } from "framer-motion";

export type ChickPhase = "peck" | "look" | "still";

export function Chick({
  phase,
  delay = 0,
  scale = 1,
  flip = false,
}: {
  phase: ChickPhase;
  delay?: number;
  scale?: number;
  flip?: boolean;
}) {
  return (
    <div style={{ transform: flip ? "scaleX(-1)" : undefined }}>
      <motion.div
        animate={
          phase === "peck"
            ? { y: [0, 6, 0], rotate: [0, -4, 0] }
            : phase === "look"
              ? { y: -3, rotate: -14 }
              : { y: 0, rotate: 0 }
        }
        transition={
          phase === "peck"
            ? { duration: 1.4, repeat: Infinity, delay, ease: "easeInOut" }
            : { duration: 0.5, ease: "easeOut" }
        }
        style={{ scale }}
      >
        <svg width="64" height="60" viewBox="0 0 64 60">
          <ellipse cx="30" cy="50" rx="16" ry="4" fill="#252525" opacity=".12" />
          <path
            d="M14 36c0-14 8-24 18-24s18 10 18 24c0 8-6 14-18 14S14 44 14 36z"
            fill="hsl(var(--background))"
            stroke="hsl(var(--foreground))"
            strokeWidth="3"
          />
          <path
            d="M40 20c3-4 8-5 11-3-1 4-5 7-9 7"
            fill="hsl(var(--background))"
            stroke="hsl(var(--foreground))"
            strokeWidth="3"
          />
          <path d="M30 24l7 4-7 3z" fill="#D8934A" stroke="hsl(var(--foreground))" strokeWidth="2" />
          {phase !== "look" && <circle cx="34" cy="20" r="2.4" fill="hsl(var(--foreground))" />}
          {phase === "look" && (
            <motion.g initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              <rect x="22" y="14" width="22" height="7" rx="1.5" fill="hsl(var(--foreground))" />
              <rect x="26" y="16" width="6" height="3" fill="hsl(var(--muted))" />
              <rect x="34" y="16" width="6" height="3" fill="hsl(var(--muted))" />
            </motion.g>
          )}
          <path d="M20 48l-2 8M40 48l2 8" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </motion.div>
    </div>
  );
}