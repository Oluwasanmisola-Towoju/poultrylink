import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const head = Space_Grotesk({ subsets: ["latin"], variable: "--font-head", weight: ["500", "600", "700"] });
const body = Manrope({ subsets: ["latin"], variable: "--font-body", weight: ["500", "700", "800"] });

export const metadata: Metadata = {
  title: "PoultryLink — Connecting the poultry ecosystem",
  description:
    "PoultryLink brings farmers, buyers, suppliers, transporters, vets and cooperatives into one trusted marketplace.",
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${head.variable} ${body.variable}`}>
      <body className="overflow-x-hidden">
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}