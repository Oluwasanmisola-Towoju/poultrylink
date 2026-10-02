import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import coolChickens from "../../../images/cool_chickens.png";

export function FinalCTA() {
  return (
    <section id="get-started" className="mx-auto max-w-6xl px-6 py-16 md:px-10 lg:px-16">
      <div className="grid overflow-hidden rounded-3xl bg-foreground text-background md:grid-cols-2">
        <div className="p-8 md:p-12">
          <h2 className="font-head text-3xl font-extrabold leading-tight md:text-4xl">Ready to join the flock?</h2>
          <p className="mt-3 text-background/70">Create an account, explore the marketplace, or log back in.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link href="/register">Create Account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-background text-background hover:bg-background/10">
              <Link href="/marketplace">Explore Marketplace</Link>
            </Button>
            <Button asChild size="lg" variant="link" className="text-background">
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </div>

        <div className="relative min-h-[16rem] md:min-h-full">
          <Image
            src={coolChickens}
            alt="A crew of confident pixel-art chickens in sunglasses, bandanas, berets and headphones"
            fill
            placeholder="blur"
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}