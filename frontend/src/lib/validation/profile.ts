import { z } from "zod";

// Mirrors updateProfile in backend/src/validators/user.validator.js.
export const profileSchema = z.object({
  firstName: z.string().min(1, "Required").max(80),
  lastName: z.string().min(1, "Required").max(80),
  businessName: z.string().max(120),
  bio: z.string().max(500, "Keep it under 500 characters"),
  address: z.string().max(200),
  state: z.string().max(80),
  lga: z.string().max(80),
});

export type ProfileValues = z.infer<typeof profileSchema>;