import { z } from "zod";
import { CuidSchema, SuccessFlagSchema } from "./common";

/**
 * Password rule shared across signup, reset, and update-password.
 * Mirrors backend src/dtos/customer.dto.ts -> PasswordOnly schema:
 *   - 8–16 chars
 *   - at least 1 lowercase, 1 uppercase, 1 number, 1 special
 *   - no whitespace
 */
const PasswordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password must be at most 16 characters")
    .regex(/^\S+$/, "Password must not contain spaces")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/\d/, "Password must include a number")
    .regex(/[^a-zA-Z0-9]/, "Password must include a special character");

const NameSchema = z.string().trim().min(2, "Must be at least 2 characters").max(50);
const PhoneSchema = z.string().min(10, "Phone must be at least 10 characters").max(20);
const OtpCodeSchema = z.string().length(6, "Code must be exactly 6 characters");

/* ─────────────────────────── Customer entity ─────────────────────────── */

export const UserRoleSchema = z.object({
    id: CuidSchema,
    name: z.string(),
    permissions: z.array(z.string()),
});

export const CustomerSchema = z.object({
    id: CuidSchema,
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    userRole: UserRoleSchema,
});

export type Customer = z.infer<typeof CustomerSchema>;

/* ──────────────────────────── Signup ──────────────────────────── */

export const SignupRequestSchema = z
    .object({
        firstName: NameSchema,
        lastName: NameSchema,
        email: z.string().email(),
        phone: PhoneSchema,
        password: PasswordSchema,
        confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type SignupRequest = z.infer<typeof SignupRequestSchema>;

export const SignupResponseSchema = z.object({
    success: z.literal(true),
    customer: z.object({ id: CuidSchema }),
});

export type SignupResponse = z.infer<typeof SignupResponseSchema>;

/* ──────────────────────────── Signin ──────────────────────────── */

export const SigninRequestSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
});

export type SigninRequest = z.infer<typeof SigninRequestSchema>;

export const SigninResponseSchema = SuccessFlagSchema;

/* ──────────────────────────── Profile ──────────────────────────── */

export const ProfileResponseSchema = z.object({
    authenticated: z.literal(true),
    success: z.literal(true),
    data: CustomerSchema,
});

export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;

/* ─────────────────────── Update profile / password ─────────────────────── */

export const UpdateProfileRequestSchema = z.object({
    firstName: NameSchema,
    lastName: NameSchema,
});

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

export const UpdatePasswordRequestSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: PasswordSchema,
        currentPasswordConfirm: z.string().min(1),
    })
    .refine((d) => d.newPassword !== d.currentPassword, {
        message: "New password must differ from current password",
        path: ["newPassword"],
    });

export type UpdatePasswordRequest = z.infer<typeof UpdatePasswordRequestSchema>;

/* ─────────────────────── Password reset flow ─────────────────────── */

export const ForgotPasswordRequestSchema = z.object({
    email: z.string().email(),
});

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

export const ForgotPasswordResponseSchema = z.object({
    success: z.literal(true),
    message: z.string(),
});

export const VerifyOtpRequestSchema = z.object({
    email: z.string().email(),
    code: OtpCodeSchema,
});

export type VerifyOtpRequest = z.infer<typeof VerifyOtpRequestSchema>;

export const ResetPasswordRequestSchema = z
    .object({
        newPassword: PasswordSchema,
        confirmPassword: z.string(),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
