"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks/use-categories";
import { useMyFarms, useCreateFarm } from "@/hooks/use-farms";
import { useMyListings, useCreateListing, useDeleteListing } from "@/hooks/use-my-listings";
import { ListingPlaceholderThumb } from "@/components/marketplace/listing-placeholder-thumb";
import { ApiClientError } from "@/lib/api/client";
import { formatNaira, formatQuantity } from "@/lib/format";

function NewFarmInline({ onCreated }: { onCreated: (farmId: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createFarm = useCreateFarm();

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-semibold underline hover:no-underline">
        + Add a new farm
      </button>
    );
  }

  return (
    <div className="border border-foreground/10 rounded-xl p-3 space-y-2">
      <Input placeholder="Farm name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
      <Button
        type="button"
        size="sm"
        disabled={createFarm.isPending || !name}
        onClick={async () => {
          setError(null);
          try {
            const farm = await createFarm.mutateAsync({ name, state: state || undefined });
            onCreated(farm.id);
            setOpen(false);
          } catch (err) {
            setError(err instanceof ApiClientError ? err.message : "Couldn't create that farm.");
          }
        }}
      >
        Save farm
      </Button>
    </div>
  );
}

function CreateListingForm() {
  const { data: categories } = useCategories();
  const { data: farms } = useMyFarms();
  const createListing = useCreateListing();

  const [farmId, setFarmId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [minOrderQuantity, setMinOrderQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [imagesText, setImagesText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!categoryId) return setError("Pick a category");
    if (!productName || !quantity || !unit || !price) return setError("Fill in product, quantity, unit and price");

    try {
      await createListing.mutateAsync({
        farmId: farmId || undefined,
        categoryId,
        productName,
        description: description || undefined,
        quantity: Number(quantity),
        unit,
        price: Number(price),
        minOrderQuantity: minOrderQuantity ? Number(minOrderQuantity) : undefined,
        location: location || undefined,
        state: state || undefined,
        lga: lga || undefined,
        images: imagesText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setSuccess(true);
      setProductName("");
      setQuantity("");
      setPrice("");
      setDescription("");
      setImagesText("");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't create that listing.");
    }
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <p className="font-head font-bold text-lg mb-3">Add a listing</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-11 w-full rounded-xl border-2 border-foreground/15 bg-background px-4 text-sm"
              >
                <option value="">Select a category</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="farm">Farm (optional)</Label>
              <select
                id="farm"
                value={farmId}
                onChange={(e) => setFarmId(e.target.value)}
                className="h-11 w-full rounded-xl border-2 border-foreground/15 bg-background px-4 text-sm"
              >
                <option value="">No farm</option>
                {farms?.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <NewFarmInline onCreated={setFarmId} />

          <div>
            <Label htmlFor="productName">Product name</Label>
            <Input id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Broiler chickens" />
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-20 rounded-xl border-2 border-foreground/15 bg-background p-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="birds, kg…" />
            </div>
            <div>
              <Label htmlFor="minOrderQuantity">Min. order</Label>
              <Input
                id="minOrderQuantity"
                type="number"
                min={0}
                value={minOrderQuantity}
                onChange={(e) => setMinOrderQuantity(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="price">Price (₦ per unit)</Label>
            <Input id="price" type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="lga">LGA</Label>
              <Input id="lga" value={lga} onChange={(e) => setLga(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="images">Image URLs (comma-separated, optional)</Label>
            <Input
              id="images"
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
              placeholder="https://…, https://…"
            />
            <p className="text-xs text-muted-foreground mt-1">
              There's no upload endpoint on the backend yet — paste links to images hosted elsewhere for now.
            </p>
          </div>

          {error && <p className="text-sm font-semibold text-destructive">{error}</p>}
          {success && <p className="text-sm font-semibold text-emerald-700">Listing created.</p>}

          <Button type="submit" className="w-full" disabled={createListing.isPending}>
            {createListing.isPending ? "Creating…" : "Create listing"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function MyListingsPage() {
  const { data, isLoading } = useMyListings();
  const deleteListing = useDeleteListing();

  return (
    <main className="px-6 md:px-10 lg:px-16 py-10 max-w-5xl mx-auto">
      <h1 className="font-head font-extrabold text-3xl mb-6">Your listings</h1>

      <div className="grid md:grid-cols-[1fr_1.2fr] gap-8">
        <CreateListingForm />

        <div>
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : !data?.data.length ? (
            <p className="text-muted-foreground">Nothing listed yet — use the form to add your first one.</p>
          ) : (
            <div className="space-y-3">
              {data.data.map((listing) => {
                const image = listing.images[0];
                return (
                  <Card key={listing.id}>
                    <CardContent className="pt-4 flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                        {image ? (
                          <Image src={image.url} alt={listing.productName} fill className="object-cover" unoptimized />
                        ) : (
                          <ListingPlaceholderThumb className="absolute inset-0" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-head font-bold truncate">{listing.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNaira(listing.price)} · {formatQuantity(listing.quantity, listing.unit)} left
                        </p>
                        <Badge variant={listing.status === "ACTIVE" ? "success" : "outline"} className="mt-1">
                          {listing.status}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deleteListing.isPending}
                        onClick={() => deleteListing.mutate(listing.id)}
                      >
                        Remove
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}