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
import { loginSchema, type LoginValues } from "@/lib/validation/auth";
import { useAuthStore } from "@/store/auth-store";
import type { User } from "@/types";
import glassesChicken from "../../../images/chicken-on-glasses.png";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setUser = useAuthStore((s) => s.setUser);
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

    async function onSubmit(values: LoginValues) {
        setFormError(null);
        try {
            const { user } = await apiFetch<{ user: User }>("/auth/login", {
                method: "POST",
                body: JSON.stringify(values),
            });
            setUser(user);
            router.push(searchParams.get("next") || "/");
            router.refresh();
        } catch (err) {
            setFormError(err instanceof ApiClientError ? err.message : "Something went wrong. Try again.");
        }
    }

    return (
        <AuthShell
             title="Welcome back"
            description="Log in to your PoultryLink account."
            image={glassesChicken}
            imageAlt="Pixel-art chicken wearing sunglasses with a cigar"
        >      
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormField label="Email" type="email" {...register("email")} error={errors.email?.message} />
                <FormField label="Password" type="password" {...register("password")} error={errors.password?.message} />

                <div className="text-right -mt-2">
                    <Link href="/forgot-password" className="text-xs font-semibold underline hover:no-underline">
                        Forgot password?
                    </Link>
                </div>

                {formError && <p className="text-sm font-semibold text-destructive text-center">{formError}</p>}

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in…" : "Log in"}
                </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-5">
                New to PoultryLink?{" "}
                <Link href="/register" className="font-bold text-foreground underline">
                    Create an account
                </Link>
            </p>
        </AuthShell>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
