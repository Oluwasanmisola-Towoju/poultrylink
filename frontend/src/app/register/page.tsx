"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/brand/auth-shell";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { registerSchema, ROLES_OPEN_AT_REGISTRATION, type RegisterValues } from "@/lib/validation/auth";
import type { User } from "@/types";

const ROLE_LABELS: Record<(typeof ROLES_OPEN_AT_REGISTRATION)[number], string> = {
    FARMER: "Farmer",
    BUYER: "Buyer",
    SUPPLIER: "Supplier",
    TRANSPORTER: "Transporter",
    VET: "Veterinarian",
    COOPERATIVE: "Cooperative",
    FINANCIER: "Financier / Insurance provider",
};

export default function RegisterPage() {
    const router = useRouter();
    const [formError, setFormError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { role: "FARMER" },
    });

    async function onSubmit(values: RegisterValues) {
        setFormError(null);
        try {
            const { user } = await apiFetch<{ user: User; otpExpiresAt: string }>("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    email: values.email,
                    phone: values.phone || undefined,
                    password: values.password,
                    role: values.role,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    businessName: values.businessName || undefined,
                }),
            });
            router.push(`/verify-otp?userId=${user.id}&purpose=REGISTRATION`);
        } catch (err) {
            setFormError(err instanceof ApiClientError ? err.message : "Something went wrong. Try again.");
        }
    }

    return (
        <AuthShell title="Create your account" description="Join the flock — it takes about a minute.">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <FormField label="First name" {...register("firstName")} error={errors.firstName?.message} />
                    <FormField label="Last name" {...register("lastName")} error={errors.lastName?.message} />
                </div>

                <FormField label="Email" type="email" {...register("email")} error={errors.email?.message} />
                <FormField
                    label="Phone (optional)"
                    type="tel"
                    placeholder="+234..."
                    {...register("phone")}
                    error={errors.phone?.message}
                />
                <FormField
                    label="Business name (optional)"
                    {...register("businessName")}
                    error={errors.businessName?.message}
                />

                <div className="space-y-1.5">
                    <Label htmlFor="role">I am a</Label>
                    <select
                        id="role"
                        {...register("role")}
                        className="flex h-11 w-full rounded-xl border-2 border-foreground/15 bg-background px-4 text-sm focus-visible:outline-none focus-visible:border-foreground"
                    >
                        {ROLES_OPEN_AT_REGISTRATION.map((r) => (
                            <option key={r} value={r}>
                                {ROLE_LABELS[r]}
                            </option>
                        ))}
                    </select>
                </div>

                <FormField label="Password" type="password" {...register("password")} error={errors.password?.message} />
                <FormField
                    label="Confirm password"
                    type="password"
                    {...register("confirmPassword")}
                    error={errors.confirmPassword?.message}
                />

                {formError && <p className="text-sm font-semibold text-destructive text-center">{formError}</p>}

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account…" : "Create account"}
                </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-5">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-foreground underline">
                    Log in
                </Link>
            </p>
        </AuthShell>
    );
}
