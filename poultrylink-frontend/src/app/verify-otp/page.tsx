"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/brand/auth-shell";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { verifyOtpSchema, type VerifyOtpValues } from "@/lib/validation/auth";
import { useAuthStore } from "@/store/auth-store";
import type { User } from "@/types";

const RESEND_COOLDOWN_SECONDS = 30;

function VerifyOtpForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setUser = useAuthStore((s) => s.setUser);

    const userId = searchParams.get("userId");
    const purpose = searchParams.get("purpose") ?? "REGISTRATION";

    const [formError, setFormError] = useState<string | null>(null);
    const [resendMessage, setResendMessage] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<VerifyOtpValues>({ resolver: zodResolver(verifyOtpSchema) });

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    if (!userId) {
        return (
            <AuthShell title="Missing verification link" description="This page needs a userId to verify — head back and register again.">
                <p className="text-sm text-center text-muted-foreground">
                    If you just registered, check the link you were sent to this page — it should carry a userId parameter.
                </p>
            </AuthShell>
        );
    }

    async function onSubmit(values: VerifyOtpValues) {
        setFormError(null);
        try {
            const { user } = await apiFetch<{ user: User }>("/auth/verify-otp", {
                method: "POST",
                body: JSON.stringify({ userId, code: values.code, purpose }),
            });
            setUser(user);
            router.push("/");
            router.refresh();
        } catch (err) {
            setFormError(err instanceof ApiClientError ? err.message : "Something went wrong. Try again.");
        }
    }

    async function handleResend() {
        setResendMessage(null);
        try {
            await apiFetch("/auth/resend-otp", {
                method: "POST",
                body: JSON.stringify({ userId, purpose: "REGISTRATION" }),
            });
            setResendMessage("A new code is on its way.");
            setCooldown(RESEND_COOLDOWN_SECONDS);
        } catch (err) {
            setResendMessage(err instanceof ApiClientError ? err.message : "Couldn't resend — try again shortly.");
        }
    }

    return (
        <AuthShell title="Check your code" description="Enter the 6-digit code we sent to verify your account.">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    label="Verification code"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    className="text-center text-2xl tracking-[0.5em] font-head"
                    {...register("code")}
                    error={errors.code?.message}
                />

                {formError && <p className="text-sm font-semibold text-destructive text-center">{formError}</p>}

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Verifying…" : "Verify"}
                </Button>
            </form>

            <div className="text-center mt-5 space-y-1">
                <Button type="button" variant="link" size="sm" onClick={handleResend} disabled={cooldown > 0}>
                    {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                </Button>
                {resendMessage && <p className="text-xs text-muted-foreground">{resendMessage}</p>}
            </div>
        </AuthShell>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense>
            <VerifyOtpForm />
        </Suspense>
    );
}
