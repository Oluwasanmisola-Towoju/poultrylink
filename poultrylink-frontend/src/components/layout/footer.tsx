import Link from "next/link";
import { Chick } from "@/components/brand/chick";

const COLUMNS: Record<string, { href: string; label: string }[]> = {
  Product: [
    { href: "/marketplace", label: "Marketplace" },
    { href: "/market-prices", label: "Market Prices" },
    { href: "/how-it-works", label: "How It Works" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/help", label: "Help" },
  ],
  Account: [
    { href: "/login", label: "Log in" },
    { href: "/register", label: "Create Account" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-8 border-t border-foreground/10 bg-card">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-1">
          <p className="font-head font-extrabold text-lg">PoultryLink</p>
          <p className="text-sm text-muted-foreground mt-2">
            Connecting Nigeria&rsquo;s poultry ecosystem, from farm to table.
          </p>
        </div>
        {Object.entries(COLUMNS).map(([heading, items]) => (
          <div key={heading}>
            <p className="text-xs font-bold uppercase text-muted-foreground mb-3">{heading}</p>
            <ul className="space-y-2 text-sm font-semibold">
              {items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:opacity-60">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-6 pb-8 opacity-90">
        {[0, 1, 2, 3].map((i) => (
          <Chick key={i} phase="peck" delay={i * 0.3} scale={0.55} />
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground pb-6">
        © {new Date().getFullYear()} PoultryLink. All rights reserved.
      </p>
    </footer>
  );
}