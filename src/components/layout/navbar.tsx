import Link from "next/link";
import { LogOut, User, ChevronDown } from "lucide-react";
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
        <nav className="flex items-center gap-1">
            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <button
                                type="button"
                                className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1 hover:border-white/30 focus-visible:border-white/30 focus-visible:outline-none"
                                aria-label="Account menu"
                            >
                                <Avatar className="size-7">
                                    <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                                        {getInitials(user.firstName, user.lastName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden text-left sm:block">
                                    <p className="text-[11px] leading-tight text-white/70">
                                        Hello, {user.firstName}
                                    </p>
                                    <p className="text-sm leading-tight font-semibold text-white">
                                        Account
                                        <ChevronDown className="ml-0.5 inline size-3" />
                                    </p>
                                </div>
                            </button>
                        }
                    />
                    <DropdownMenuContent align="end" className="w-52">
                        <div className="px-3 py-2">
                            <p className="text-sm font-semibold">
                                {user.firstName} {user.lastName}
                            </p>
                            <p className="text-muted-foreground text-xs">{user.email}</p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            render={
                                <Link href="/account" className="cursor-pointer">
                                    <User className="mr-2 size-4" />
                                    My Account
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
                <div className="flex items-center gap-1">
                    <Link
                        href="/signin"
                        className="flex items-center gap-2 rounded-md border border-transparent px-3 py-1 hover:border-white/30"
                    >
                        <User className="size-5 text-white/80" />
                        <div className="hidden sm:block">
                            <span className="block text-[11px] leading-tight text-white/70">
                                Hello, sign in
                            </span>
                            <span className="block text-sm leading-tight font-semibold text-white">
                                Account
                            </span>
                        </div>
                    </Link>
                    <Link
                        href="/signup"
                        className="bg-accent text-accent-foreground hover:bg-gold-500 ml-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors duration-100"
                    >
                        Sign up
                    </Link>
                </div>
            )}
        </nav>
    );
}
