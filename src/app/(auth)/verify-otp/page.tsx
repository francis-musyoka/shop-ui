import { redirect } from "next/navigation";
import { OtpForm } from "./otp-form";

interface VerifyOtpPageProps {
    searchParams: Promise<{ email?: string }>;
}

export default async function VerifyOtpPage({ searchParams }: VerifyOtpPageProps) {
    const params = await searchParams;
    const email = params.email;

    if (!email) {
        redirect("/forgot-password");
    }

    return <OtpForm email={email} />;
}
