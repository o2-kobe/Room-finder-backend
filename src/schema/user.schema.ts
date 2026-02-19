import { z } from "zod";

// Body schema
const userBody = z
  .object({
    username: z.string().min(4, "Username must be at least 4 characters"),
    role: z.enum(["tenant", "landlord", "student"]),
    email: z.email(),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .max(72, "Password must not exceed 72 bytes"),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

// Route schemas
export const createUserSchema = z.object({
  body: userBody,
});

// Types
export type CreateUserRequest = z.infer<typeof userBody>;

export type CreateUserInput = Omit<z.infer<typeof userBody>, "passwordConfirm">;
