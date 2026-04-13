export default function AccountLayout({ children }: { children: React.ReactNode }) {
  // TODO(plan-03): replace with `await requireAuth()` + AccountShell.
  return <main className="mx-auto max-w-4xl flex-1 px-4 py-8">{children}</main>;
}
