"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { profileSchema, type ProfileValues } from "@/lib/validation/profile";
import { useAuthStore } from "@/store/auth-store";
import type { Profile } from "@/types";

export default function ProfilePage() {
  const { user, status, setUser } = useAuthStore();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema) });

  // Fill the form once the session has loaded.
  useEffect(() => {
    if (!user?.profile) return;
    reset({
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      businessName: user.profile.businessName ?? "",
      bio: user.profile.bio ?? "",
      address: user.profile.address ?? "",
      state: user.profile.state ?? "",
      lga: user.profile.lga ?? "",
    });
  }, [user?.profile, reset]);

  if (status === "idle" || status === "loading") {
    return <main className="px-6 py-16 text-center text-muted-foreground">Loading…</main>;
  }
  if (!user) {
    return <main className="px-6 py-16 text-center text-muted-foreground">Log in to see your profile.</main>;
  }

  async function onSubmit(values: ProfileValues) {
    if (!user) return;
    setFormError(null);
    setSaved(false);
    try {
      const profile = await apiFetch<Profile>("/users/me", { method: "PATCH", body: JSON.stringify(values) });
      setUser({ ...user, profile }); // keeps the navbar name etc. in sync
      setSaved(true);
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : "Something went wrong. Try again.");
    }
  }

  async function copyId() {
    if (!user) return;
    try {
      await navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard can be blocked; the id is still visible to select by hand */
    }
  }

  return (
    <main className="px-6 md:px-10 lg:px-16 py-10 max-w-2xl mx-auto space-y-6">
      <h1 className="font-head font-extrabold text-3xl">Your profile</h1>

      <Card>
        <CardContent className="pt-5 space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{user.role}</Badge>
            <Badge
              variant={
                user.verificationStatus === "VERIFIED"
                  ? "success"
                  : user.verificationStatus === "REJECTED"
                  ? "destructive"
                  : "outline"
              }
            >
              {user.verificationStatus}
            </Badge>
          </div>
          <p>
            <span className="text-muted-foreground">Email:</span> {user.email}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">User ID:</span>
            <code className="text-xs break-all">{user.id}</code>
            <Button type="button" size="sm" variant="outline" onClick={copyId}>
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          {user.role === "TRANSPORTER" && (
            <p className="text-xs text-muted-foreground">
              Farmers need this ID to assign you to a delivery when they dispatch an order.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="First name" {...register("firstName")} error={errors.firstName?.message} />
              <FormField label="Last name" {...register("lastName")} error={errors.lastName?.message} />
            </div>
            <FormField label="Business name" {...register("businessName")} error={errors.businessName?.message} />

            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                rows={4}
                {...register("bio")}
                className="flex w-full rounded-xl border-2 border-foreground/15 bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-foreground"
              />
              {errors.bio && <p className="text-xs font-semibold text-destructive">{errors.bio.message}</p>}
            </div>

            <FormField label="Address" {...register("address")} error={errors.address?.message} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="State" {...register("state")} error={errors.state?.message} />
              <FormField label="LGA" {...register("lga")} error={errors.lga?.message} />
            </div>

            {formError && <p className="text-sm font-semibold text-destructive">{formError}</p>}
            {saved && !isDirty && <p className="text-sm font-semibold text-emerald-700">Saved.</p>}

            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}