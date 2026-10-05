import { Hero } from "@/components/sections/hero";
import { MarketplaceIntro } from "@/components/sections/marketplace-intro";
import { Categories } from "@/components/sections/categories";
import { HowItWorks } from "@/components/sections/how-it-works";
import { EggHatch } from "@/components/sections/egg-hatch";
import { Ecosystem } from "@/components/sections/ecosystem";
import { MarketPrices } from "@/components/sections/market-prices";
import { FinalCTA } from "@/components/sections/final-cta";

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      <Hero />
      <MarketplaceIntro />
      <Categories />
      <HowItWorks />
      <EggHatch />
      <Ecosystem />
      <MarketPrices />
      <FinalCTA />
    </main>
  );
}