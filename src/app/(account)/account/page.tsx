import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import { logoutAction } from "./actions";

export default async function AccountPage() {
    const session = await getSession();
    if (!session) redirect("/signin");

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Account</h1>
                <p className="text-muted-foreground text-sm">
                    Manage your profile and security settings
                </p>
            </div>

            <ProfileForm user={session.user} />

            <Separator />

            <PasswordForm />

            <Separator />

            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Sign out</h2>
                <form action={logoutAction}>
                    <button
                        type="submit"
                        className="text-destructive hover:text-destructive/80 text-sm underline underline-offset-4"
                    >
                        Sign out of your account
                    </button>
                </form>
            </div>
        </div>
    );
}
