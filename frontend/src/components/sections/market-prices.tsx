import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import basket from "../../../images/eggs.png";

const ROWS = [
  { name: "Live Birds", price: "₦4,200 /bird", bars: [60, 64, 58, 70, 66, 72] },
  { name: "Eggs", price: "₦2,800 /crate", bars: [50, 55, 53, 60, 58, 63] },
  { name: "Day-Old Chicks", price: "₦650 /chick", bars: [40, 42, 45, 44, 48, 50] },
];

export function MarketPrices() {
  return (
    <section id="market-prices" className="mx-auto max-w-6xl px-6 py-16 md:px-10 lg:px-16">
      <div className="mb-10 flex flex-col items-center gap-6 md:flex-row md:justify-between">
        <div className="text-center md:text-left">
          <h2 className="font-head text-3xl font-extrabold md:text-4xl">Market prices, at a glance</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Average pricing by category and state, so you know what&rsquo;s fair before you buy or sell.
          </p>
        </div>

        <div className="pixel-shadow relative aspect-[3/2] w-64 shrink-0 overflow-hidden rounded-2xl border-2 border-foreground">
          <Image
            src={basket}
            alt="A basket of eggs, two of them wearing sunglasses and a cap"
            fill
            placeholder="blur"
            sizes="256px"
            className="object-cover"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {ROWS.map((row) => (
          <Card key={row.name}>
            <CardContent className="pt-5">
              <p className="text-xs font-bold uppercase text-muted-foreground">{row.name}</p>
              <p className="mt-1 font-head text-2xl font-extrabold">{row.price}</p>
              <div className="mt-4 flex h-12 items-end gap-1">
                {row.bars.map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-foreground/80" style={{ height: `${h}%` }} />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Sample data — live figures come from the Market Prices page once listings start flowing.
      </p>
    </section>
  );
}