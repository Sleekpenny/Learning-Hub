"use client";

import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useCurrentUser, useSignOut } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { MenuIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/common/container";
import { Navbar } from "@/components/layout/nav-bar";
import Link from "next/link";

type NavItem = { href: string; status?: boolean; label: string };


const links: Record<"learner" | "admin", NavItem[]> = {
  learner: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/courses", label: "Browse courses" },
  ],
  admin: [{ href: "/admin", label: "Overview" }],
};

const Sidebar = ({
  children,
  variant = "learner",
}: {
  children: ReactNode;
  variant?: "learner" | "admin";
}) => {
  const { user } = useCurrentUser();
  const { signOut, error } = useSignOut();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = (
    <nav
      aria-label={variant === "admin" ? "Admin" : "Dashboard"}
      className="flex flex-col gap-1"
    >
      {links[variant].map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const account = (
    <div className="border-t pt-4">
      <p className="truncate text-sm font-semibold">{user?.name}</p>
      <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
      <Button variant="outline" onClick={signOut} className="mt-3 w-full">
        Log out
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );

  return (
    <>
      <Navbar />
      <Container className="min-h-screen lg:flex">
        <aside className="hidden w-64 shrink-0 flex-col justify-between border-r bg-white p-5 lg:flex">
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              {variant === "admin" && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  Admin
                </span>
              )}
            </div>
            {nav}
          </div>
          {account}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b bg-white lg:hidden">
            <div className="flex h-16 items-center justify-between px-4">            
              <button
                type="button"
                className="rounded-lg p-2 hover:bg-muted"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="app-menu"
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? (
                  <X className="size-6" />
                ) : (
                  <MenuIcon className="size-6" />
                )}
              </button>
            </div>
            {menuOpen && (
              <div id="app-menu" className="space-y-4 border-t px-4 py-4">
                {nav}
                {account}
              </div>
            )}
          </header>

          <main
            id="main"
            className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-10"
          >
            {children}
          </main>
        </div>
      </Container>
    </>
  );
};

export default Sidebar;