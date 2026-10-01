import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListingPlaceholderThumb } from "./listing-placeholder-thumb";
import { formatNaira, formatQuantity } from "@/lib/format";
import type { Listing } from "@/types";

export function ListingCard({ listing }: { listing: Listing }) {
  const image = listing.images[0];
  const sellerName =
    listing.seller?.profile?.businessName ||
    [listing.seller?.profile?.firstName, listing.seller?.profile?.lastName].filter(Boolean).join(" ") ||
    "Seller";

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="overflow-hidden h-full hover:-translate-y-1 hover:shadow-md transition">
        <div className="relative aspect-square w-full">
          {image ? (
            <Image src={image.url} alt={listing.productName} fill className="object-cover" unoptimized />
          ) : (
            <ListingPlaceholderThumb className="absolute inset-0" />
          )}
          {listing.verificationStatus === "VERIFIED" && (
            <Badge variant="success" className="absolute top-2 left-2">
              Verified
            </Badge>
          )}
        </div>
        <CardContent className="pt-4">
          {listing.category && (
            <p className="text-xs font-bold uppercase text-muted-foreground">{listing.category.name}</p>
          )}
          <p className="font-head font-bold text-base mt-0.5 line-clamp-1">{listing.productName}</p>
          <p className="font-head font-extrabold text-lg mt-1">{formatNaira(listing.price)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatQuantity(listing.quantity, listing.unit)} available
          </p>
          <p className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
            <span className="truncate">{sellerName}</span>
            {listing.state && <span>{listing.state}</span>}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}