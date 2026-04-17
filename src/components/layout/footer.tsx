"use client";

import Link from "next/link";

export function Footer() {
    return (
        <footer>
            {/* Back to top */}
            <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="bg-gold-400 text-brand-900 hover:bg-gold-500 block w-full py-3 text-center text-sm font-semibold"
            >
                Back to top
            </button>

            {/* Main footer */}
            <div className="bg-gold-100 text-brand-800 dark:bg-gold-200/10 dark:text-brand-200 px-4 py-10 md:px-6">
                <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 sm:grid-cols-4">
                    {/* Brand */}
                    <div>
                        <h3 className="text-brand-800 font-[family-name:var(--font-brand)] text-lg font-bold dark:text-white">
                            Riverflow
                        </h3>
                        <p className="text-brand-700 dark:text-brand-300 mt-2 text-sm leading-relaxed">
                            Kenya&apos;s vibrant marketplace. Find great deals, message sellers
                            directly, and make it happen.
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <h3 className="text-brand-800 text-sm font-semibold dark:text-white">
                            Shop
                        </h3>
                        <ul className="text-brand-700 dark:text-brand-300 mt-3 space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/browse"
                                    className="hover:text-brand-900 dark:hover:text-white"
                                >
                                    Browse All
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/deals"
                                    className="hover:text-brand-900 dark:hover:text-white"
                                >
                                    Today&apos;s Deals
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/categories"
                                    className="hover:text-brand-900 dark:hover:text-white"
                                >
                                    Categories
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Account */}
                    <div>
                        <h3 className="text-brand-800 text-sm font-semibold dark:text-white">
                            Account
                        </h3>
                        <ul className="text-brand-700 dark:text-brand-300 mt-3 space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/signin"
                                    className="hover:text-brand-900 dark:hover:text-white"
                                >
                                    Sign In
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/signup"
                                    className="hover:text-brand-900 dark:hover:text-white"
                                >
                                    Create Account
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/account"
                                    className="hover:text-brand-900 dark:hover:text-white"
                                >
                                    My Account
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Help */}
                    <div>
                        <h3 className="text-brand-800 text-sm font-semibold dark:text-white">
                            Help
                        </h3>
                        <ul className="text-brand-700 dark:text-brand-300 mt-3 space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/help"
                                    className="hover:text-brand-900 dark:hover:text-white"
                                >
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/sell"
                                    className="hover:text-brand-900 dark:hover:text-white"
                                >
                                    Sell on Riverflow
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="bg-brand-800 dark:bg-brand-900 px-4 py-4 md:px-6">
                <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 sm:flex-row sm:justify-between">
                    <Link
                        href="/"
                        className="font-[family-name:var(--font-brand)] text-sm font-bold text-white"
                    >
                        Riverflow
                    </Link>
                    <p className="text-brand-300 text-xs">
                        &copy; {new Date().getFullYear()} Riverflow. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
