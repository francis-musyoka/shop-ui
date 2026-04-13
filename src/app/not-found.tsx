import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RootNotFound() {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground mt-3">We couldn&apos;t find that page.</p>
        <Button render={<Link href="/" />} nativeButton={false} className="mt-6">
          Go home
        </Button>
      </div>
    </main>
  );
}
