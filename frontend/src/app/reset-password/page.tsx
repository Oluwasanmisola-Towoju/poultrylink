"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/brand/auth-shell";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validation/auth";

function ResetPasswordForm() {
  const router = useRouter();
  const email = useSearchParams().get("email");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) });

  if (!email) {
    return (
      <AuthShell title="Start from the beginning" description="We need to know which account you're resetting.">
        <p className="text-center text-sm">
          <Link href="/forgot-password" className="font-bold underline">
            Request a reset code
          </Link>
        </p>
      </AuthShell>
    );
  }

  async function onSubmit(values: ResetPasswordValues) {
    setFormError(null);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, code: values.code, newPassword: values.newPassword }),
      });
      router.push("/login");
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : "Something went wrong. Try again.");
    }
  }

  return (
    <AuthShell title="Set a new password" description={`Enter the code sent to ${email}.`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="6-digit code"
          inputMode="numeric"
          maxLength={6}
          {...register("code")}
          error={errors.code?.message}
        />
        <FormField label="New password" type="password" {...register("newPassword")} error={errors.newPassword?.message} />
        <FormField
          label="Confirm new password"
          type="password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        {formError && <p className="text-sm font-semibold text-destructive text-center">{formError}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Reset password"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}