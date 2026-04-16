import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Customer } from "@/lib/schemas/customer";
import { logoutAction } from "@/app/(account)/account/actions";

interface NavbarProps {
    user: Customer | null;
}

function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function Navbar({ user }: NavbarProps) {
    return (
        <nav className="flex items-center gap-4">
            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <button
                                type="button"
                                className="focus-visible:ring-ring rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                aria-label="Account menu"
                            >
                                <Avatar className="size-8">
                                    <AvatarFallback className="text-xs">
                                        {getInitials(user.firstName, user.lastName)}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        }
                    />
                    <DropdownMenuContent align="end" className="w-48">
                        <div className="px-2 py-1.5">
                            <p className="text-sm font-medium">
                                {user.firstName} {user.lastName}
                            </p>
                            <p className="text-muted-foreground text-xs">{user.email}</p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            render={
                                <Link href="/account" className="cursor-pointer">
                                    <User className="mr-2 size-4" />
                                    Account
                                </Link>
                            }
                        />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            render={
                                <form action={logoutAction} className="w-full">
                                    <button
                                        type="submit"
                                        className="flex w-full items-center text-left"
                                    >
                                        <LogOut className="mr-2 size-4" />
                                        Sign out
                                    </button>
                                </form>
                            }
                        />
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        render={<Link href="/signin" />}
                        nativeButton={false}
                    >
                        Sign in
                    </Button>
                    <Button
                        variant="accent"
                        size="sm"
                        render={<Link href="/signup" />}
                        nativeButton={false}
                    >
                        Sign up
                    </Button>
                </div>
            )}
        </nav>
    );
}
