import { z } from "zod";

// Mirrors backend/src/validators/auth.validator.js — keep these in sync.

const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "Needs an uppercase letter")
  .regex(/[a-z]/, "Needs a lowercase letter")
  .regex(/[0-9]/, "Needs a number");

// ADMIN is intentionally excluded — admins are provisioned, not self-registered.
export const ROLES_OPEN_AT_REGISTRATION = [
  "FARMER",
  "BUYER",
  "SUPPLIER",
  "TRANSPORTER",
  "VET",
  "COOPERATIVE",
  "FINANCIER",
] as const;

export const registerSchema = z
  .object({
    email: z.string().email(),
    phone: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number")
      .optional()
      .or(z.literal("")),
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.enum(ROLES_OPEN_AT_REGISTRATION),
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    businessName: z.string().max(120).optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const verifyOtpSchema = z.object({
  code: z.string().length(6, "Enter the 6-digit code"),
});

export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;