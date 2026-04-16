import { SigninForm } from "./signin-form";

interface SigninPageProps {
    searchParams: Promise<{ next?: string; registered?: string; reset?: string }>;
}

export default async function SigninPage({ searchParams }: SigninPageProps) {
    const params = await searchParams;
    return <SigninForm next={params.next} />;
}
