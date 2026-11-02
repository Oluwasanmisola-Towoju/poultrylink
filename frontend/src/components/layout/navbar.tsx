"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";
import type { UserRole } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { NotificationBell } from "@/components/notifications/notification-bell";

const LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/market-prices", label: "Market Prices" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
];

// Only roles that have a dashboard built get extra links. Listing and order
// handling are FARMER-only on the Express side, so SUPPLIER, VET, COOPERATIVE
// and FINANCIER see nothing extra until those roles get real features.
function dashboardLinksFor(role: UserRole): { href: string; label: string }[] {
  switch (role) {
    case "BUYER":
      return [{ href: "/orders", label: "My Orders" }];
    case "FARMER":
      return [
        { href: "/selling/listings", label: "My Listings" },
        { href: "/selling/orders", label: "Orders" },
      ];
    case "TRANSPORTER":
      return [{ href: "/delivering/deliveries", label: "My Deliveries" }];
    case "ADMIN":
      return [{ href: "/admin", label: "Admin" }];
    default:
      return [];
  }
}

export function Navbar() {
  const { user, status, clear } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => null);
    clear();
    queryClient.clear();
    setMenuOpen(false);
    router.replace("/login");
    router.refresh();
  }

  const isAuthed = status === "authenticated" && user;
  const dashboardLinks = isAuthed ? dashboardLinksFor(user.role) : [];
  const allLinks = [...LINKS, ...dashboardLinks];

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-background/90 border-b border-foreground/10">
      <nav className="flex items-center justify-between px-6 md:px-10 lg:px-16 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 font-head font-extrabold text-lg">
          <span className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center text-background text-sm">
            PL
          </span>
          PoultryLink
        </Link>

        <ul className="hidden md:flex items-center gap-8 text-sm font-semibold">
          {allLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:opacity-70 transition">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            {isAuthed ? (
              <>
                <NotificationBell />
                <Link href="/profile" className="text-sm font-bold hover:opacity-70">
                  {user.profile?.firstName ?? "Account"}
                </Link>
                <Button size="sm" variant="outline" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-bold hover:opacity-70">
                  Log in
                </Link>
                <Button asChild size="sm">
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {isAuthed && (
            <div className="md:hidden">
              <NotificationBell />
            </div>
          )}

          <button
            type="button"
            className="md:hidden p-2 -mr-2 rounded-lg hover:bg-secondary"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden border-t border-foreground/10 px-6 pb-5 pt-3 space-y-1">
          {allLinks.map((l) => (
            <Link key={l.href} href={l.href} className="block py-2.5 text-sm font-semibold">
              {l.label}
            </Link>
          ))}

          <div className="pt-3 mt-2 border-t border-foreground/10 flex flex-col gap-2">
            {isAuthed ? (
              <>
                <Link href="/profile" className="block py-2 text-sm font-bold">
                  {user.profile?.firstName ?? "Account"} · Profile
                </Link>
                <Button variant="outline" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}