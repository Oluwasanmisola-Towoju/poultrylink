"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/brand/auth-shell";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validation/auth";

function ForgotPasswordForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordValues) {
    setFormError(null);
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(values),
      });
      router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : "Something went wrong. Try again.");
    }
  }

  return (
    <AuthShell title="Reset your password" description="We’ll send a verification code to your email.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email" type="email" {...register("email")} error={errors.email?.message} />
        {formError && <p className="text-sm font-semibold text-destructive text-center">{formError}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send reset code"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground mt-5">
        Remembered your password?{" "}
        <Link href="/login" className="font-bold underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
