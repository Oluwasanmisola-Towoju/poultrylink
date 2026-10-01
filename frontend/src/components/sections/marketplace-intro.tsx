import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import eggCrates from "../../../images/egg_crates.png";

const ITEMS = [
  ["Product discovery", "Search live birds, eggs, chicks, feed and more by location, price and quantity."],
  ["Verified sellers", "Farms and suppliers carry a verification badge before they can list."],
  ["Market prices", "Average pricing by category and state, sourced from real transactions."],
  ["Orders & delivery", "One workflow from order to escrow to confirmed delivery."],
] as const;

export function MarketplaceIntro() {
  return (
    <section id="marketplace" className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-16">
      <h2 className="mb-10 text-center font-head text-3xl font-extrabold md:text-4xl">
        The marketplace, built for trust
      </h2>

      <div className="grid gap-8 md:grid-cols-[5fr_6fr]">
        <div className="pixel-shadow relative min-h-[18rem] overflow-hidden rounded-3xl border-2 border-foreground">
          <Image
            src={eggCrates}
            alt="Crates of fresh eggs on a wooden table"
            fill
            placeholder="blur"
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="grid content-center gap-4">
          {ITEMS.map(([title, desc]) => (
            <Card key={title} className="transition hover:-translate-y-1 hover:shadow-md">
              <CardContent className="pt-5">
                <CardTitle>{title}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}