import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { expressFetch } from "@/lib/api/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ListingPlaceholderThumb } from "@/components/marketplace/listing-placeholder-thumb";
import { formatNaira, formatQuantity } from "@/lib/format";
import type { Listing } from "@/types";
import { PlaceOrderForm } from "@/components/marketplace/place-order-form";

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const result = await expressFetch<{ listing: Listing }>(`/listings/${params.id}`);

  if (!result.success) {
    notFound();
  }

  const listing = result.data.listing;
  const image = listing.images[0];
  const sellerName =
    listing.seller?.profile?.businessName ||
    [listing.seller?.profile?.firstName, listing.seller?.profile?.lastName].filter(Boolean).join(" ") ||
    "Seller";

  return (
    <main className="px-6 md:px-10 lg:px-16 py-10 max-w-5xl mx-auto">
      <Link href="/marketplace" className="text-sm font-semibold underline hover:no-underline">
        ← Back to marketplace
      </Link>

      <div className="grid md:grid-cols-2 gap-8 mt-6">
        <div className="relative aspect-square rounded-2xl overflow-hidden border border-foreground/10">
          {image ? (
            <Image src={image.url} alt={listing.productName} fill className="object-cover" unoptimized />
          ) : (
            <ListingPlaceholderThumb className="absolute inset-0" />
          )}
        </div>

        <div>
          {listing.category && <p className="text-xs font-bold uppercase text-muted-foreground">{listing.category.name}</p>}
          <h1 className="font-head font-extrabold text-3xl mt-1">{listing.productName}</h1>

          <div className="flex items-center gap-2 mt-3">
            {listing.verificationStatus === "VERIFIED" && <Badge variant="success">Verified listing</Badge>}
            <Badge variant="outline">{listing.status === "ACTIVE" ? "Available" : listing.status}</Badge>
          </div>

          <p className="font-head font-extrabold text-3xl mt-4">{formatNaira(listing.price)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatQuantity(listing.quantity, listing.unit)} available · min. order {formatQuantity(listing.minOrderQuantity, listing.unit)}
          </p>

          {listing.description && <p className="mt-4 text-sm leading-relaxed">{listing.description}</p>}

          <Card className="mt-6">
            <CardContent className="pt-5 space-y-1">
              <p className="text-xs font-bold uppercase text-muted-foreground">Seller</p>
              <p className="font-head font-bold">{sellerName}</p>
              {(listing.location || listing.state) && (
                <p className="text-sm text-muted-foreground">
                  {[listing.location, listing.lga, listing.state].filter(Boolean).join(", ")}
                </p>
              )}
              {listing.seller?.verificationStatus === "VERIFIED" && (
                <Badge variant="success" className="mt-1">
                  Verified seller
                </Badge>
              )}
            </CardContent>
          </Card>

          {listing.status === "ACTIVE" ? (
            <PlaceOrderForm listing={listing} />
          ) : (
            <p className="text-sm text-muted-foreground text-center mt-6 border border-foreground/10 rounded-xl py-3">
              This listing is currently {listing.status.toLowerCase().replace("_", " ")}.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}