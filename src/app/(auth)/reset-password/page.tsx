import { redirect } from "next/navigation";
import { readCookie } from "@/lib/auth/cookie-store";
import { ResetForm } from "./reset-form";

export default async function ResetPasswordPage() {
    const resetToken = await readCookie("resetToken");
    if (!resetToken) redirect("/forgot-password");

    return <ResetForm />;
}
