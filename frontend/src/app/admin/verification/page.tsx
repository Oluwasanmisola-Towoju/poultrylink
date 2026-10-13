"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminUsers, useSetVerificationStatus } from "@/hooks/use-admin";
import { ApiClientError } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import type { UserRole, VerificationStatus } from "@/types";

const ROLE_OPTIONS: UserRole[] = ["FARMER", "BUYER", "SUPPLIER", "TRANSPORTER", "VET", "COOPERATIVE", "FINANCIER"];
const STATUS_OPTIONS: VerificationStatus[] = ["UNVERIFIED", "PENDING", "VERIFIED", "REJECTED"];

export default function AdminVerificationPage() {
  const [role, setRole] = useState<UserRole | "">("");
  // New accounts start UNVERIFIED (there's no flow that moves them to
  // PENDING yet), so that's the useful default to land on.
  const [status, setStatus] = useState<VerificationStatus>("PENDING"); // was "UNVERIFIED"
  const [error, setError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const { data, isLoading } = useAdminUsers({ role: role || undefined, verificationStatus: status });
  const setVerification = useSetVerificationStatus();

  async function run(id: string, next: "VERIFIED" | "REJECTED") {
    setError(null);
    setActingOn(id);
    try {
      await setVerification.mutateAsync({ id, status: next });
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Something went wrong.");
    } finally {
      setActingOn(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as VerificationStatus)}
          className="border border-foreground/20 rounded-lg px-3 py-2 text-sm font-semibold bg-background"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole | "")}
          className="border border-foreground/20 rounded-lg px-3 py-2 text-sm font-semibold bg-background"
        >
          <option value="">All roles</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !data?.data.length ? (
        <p className="text-muted-foreground">No users match this filter.</p>
      ) : (
        <div className="space-y-3">
          {data.data.map((u) => (
            <Card key={u.id}>
              <CardContent className="pt-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-head font-bold">
                    {u.profile ? `${u.profile.firstName} ${u.profile.lastName}` : u.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {u.email} · {u.role} · joined {formatDate(u.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={
                      u.verificationStatus === "VERIFIED"
                        ? "success"
                        : u.verificationStatus === "REJECTED"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {u.verificationStatus}
                  </Badge>
                  <Button
                    size="sm"
                    disabled={setVerification.isPending && actingOn === u.id}
                    onClick={() => run(u.id, "VERIFIED")}
                  >
                    Verify
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={setVerification.isPending && actingOn === u.id}
                    onClick={() => run(u.id, "REJECTED")}
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}