import { describe, it, expect } from "vitest";
import {
    CustomerSchema,
    ProfileResponseSchema,
    SigninRequestSchema,
    SignupRequestSchema,
    SignupResponseSchema,
    ForgotPasswordRequestSchema,
    VerifyOtpRequestSchema,
    ResetPasswordRequestSchema,
    UpdateProfileRequestSchema,
    UpdatePasswordRequestSchema,
} from "./customer";
import customerFixtures from "../../../tests/fixtures/backend/customers.json";

describe("CustomerSchema", () => {
    it("parses the profile.data shape from real backend fixture", () => {
        const parsed = CustomerSchema.parse(customerFixtures.profileSuccess.data);
        expect(parsed.email).toBe("user@example.com");
        expect(parsed.userRole.name).toBe("CUSTOMER");
        expect(parsed.userRole.permissions).toContain("PRODUCT_VIEW");
    });

    it("rejects missing firstName", () => {
        expect(() =>
            CustomerSchema.parse({
                id: "cl9ebqhxk00003b6093z6n3kc",
                email: "x@y.com",
                lastName: "Doe",
                userRole: { id: "cl9ebqhxk00004role0000001", name: "CUSTOMER", permissions: [] },
            }),
        ).toThrow();
    });
});

describe("ProfileResponseSchema", () => {
    it("parses the full profile response from fixture", () => {
        const parsed = ProfileResponseSchema.parse(customerFixtures.profileSuccess);
        expect(parsed.authenticated).toBe(true);
        expect(parsed.data.email).toBe("user@example.com");
    });
});

describe("SignupRequestSchema", () => {
    const valid = {
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        phone: "+254700000000",
        password: "Strong1Pass!",
        confirmPassword: "Strong1Pass!",
    };

    it("accepts a valid signup payload", () => {
        expect(SignupRequestSchema.parse(valid)).toEqual(valid);
    });

    it("rejects when password and confirmPassword don't match", () => {
        expect(() =>
            SignupRequestSchema.parse({ ...valid, confirmPassword: "Different1Pass!" }),
        ).toThrow();
    });

    it("rejects short firstName", () => {
        expect(() => SignupRequestSchema.parse({ ...valid, firstName: "J" })).toThrow();
    });

    it("rejects invalid email", () => {
        expect(() => SignupRequestSchema.parse({ ...valid, email: "not-an-email" })).toThrow();
    });

    it("rejects short phone", () => {
        expect(() => SignupRequestSchema.parse({ ...valid, phone: "12345" })).toThrow();
    });

    it("rejects password without uppercase", () => {
        expect(() =>
            SignupRequestSchema.parse({
                ...valid,
                password: "weakpass1!",
                confirmPassword: "weakpass1!",
            }),
        ).toThrow();
    });

    it("rejects password without special character", () => {
        expect(() =>
            SignupRequestSchema.parse({
                ...valid,
                password: "WeakPass1",
                confirmPassword: "WeakPass1",
            }),
        ).toThrow();
    });

    it("rejects password with spaces", () => {
        expect(() =>
            SignupRequestSchema.parse({
                ...valid,
                password: "Weak Pass1!",
                confirmPassword: "Weak Pass1!",
            }),
        ).toThrow();
    });
});

describe("SignupResponseSchema", () => {
    it("parses a real backend signup-success fixture", () => {
        const parsed = SignupResponseSchema.parse(customerFixtures.signupSuccess);
        expect(parsed.customer.id).toBe("cl9ebqhxk00003b6093z6n3kc");
    });
});

describe("SigninRequestSchema", () => {
    it("accepts a valid signin payload", () => {
        expect(SigninRequestSchema.parse({ email: "x@y.com", password: "anything" })).toBeDefined();
    });

    it("rejects empty password", () => {
        expect(() => SigninRequestSchema.parse({ email: "x@y.com", password: "" })).toThrow();
    });

    it("rejects invalid email", () => {
        expect(() => SigninRequestSchema.parse({ email: "not-an-email", password: "x" })).toThrow();
    });
});

describe("ForgotPasswordRequestSchema", () => {
    it("accepts a valid email", () => {
        expect(ForgotPasswordRequestSchema.parse({ email: "x@y.com" })).toEqual({
            email: "x@y.com",
        });
    });

    it("rejects invalid email", () => {
        expect(() => ForgotPasswordRequestSchema.parse({ email: "x" })).toThrow();
    });
});

describe("VerifyOtpRequestSchema", () => {
    it("accepts an exactly-6-char code", () => {
        expect(VerifyOtpRequestSchema.parse({ email: "x@y.com", code: "123456" })).toBeDefined();
    });

    it("rejects shorter code", () => {
        expect(() => VerifyOtpRequestSchema.parse({ email: "x@y.com", code: "12345" })).toThrow();
    });

    it("rejects longer code", () => {
        expect(() => VerifyOtpRequestSchema.parse({ email: "x@y.com", code: "1234567" })).toThrow();
    });
});

describe("ResetPasswordRequestSchema", () => {
    it("requires matching passwords", () => {
        expect(() =>
            ResetPasswordRequestSchema.parse({
                newPassword: "Strong1Pass!",
                confirmPassword: "Different1Pass!",
            }),
        ).toThrow();
    });

    it("accepts matching strong passwords", () => {
        expect(
            ResetPasswordRequestSchema.parse({
                newPassword: "Strong1Pass!",
                confirmPassword: "Strong1Pass!",
            }),
        ).toBeDefined();
    });
});

describe("UpdateProfileRequestSchema", () => {
    it("accepts valid first/last name", () => {
        expect(
            UpdateProfileRequestSchema.parse({ firstName: "Jane", lastName: "Doe" }),
        ).toBeDefined();
    });

    it("rejects 1-char firstName", () => {
        expect(() =>
            UpdateProfileRequestSchema.parse({ firstName: "J", lastName: "Doe" }),
        ).toThrow();
    });
});

describe("UpdatePasswordRequestSchema", () => {
    it("rejects when newPassword equals currentPassword", () => {
        expect(() =>
            UpdatePasswordRequestSchema.parse({
                currentPassword: "Strong1Pass!",
                newPassword: "Strong1Pass!",
                currentPasswordConfirm: "Strong1Pass!",
            }),
        ).toThrow();
    });

    it("accepts a valid password change", () => {
        expect(
            UpdatePasswordRequestSchema.parse({
                currentPassword: "Strong1Pass!",
                newPassword: "Another2Pass!",
                currentPasswordConfirm: "Another2Pass!",
            }),
        ).toBeDefined();
    });

    it("rejects when currentPasswordConfirm does not match newPassword", () => {
        expect(() =>
            UpdatePasswordRequestSchema.parse({
                currentPassword: "Strong1Pass!",
                newPassword: "Another2Pass!",
                currentPasswordConfirm: "Strong1Pass!",
            }),
        ).toThrow();
    });
});
