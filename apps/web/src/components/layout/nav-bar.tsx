"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurrentUser, useSignOut } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Container } from "../common/container";
import { Button, buttonVariants } from "../ui/button";
import { MenuIcon, X } from "lucide-react";
import { Logo } from "../common/ui/logo";

export function Navbar() {
  const { user, isLoading } = useCurrentUser();
  const { signOut } = useSignOut();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
  }, [menuOpen]);

  const links = [
    { href: "/", label: "Home" },
    { href: user?.role === "ADMIN" ? "/admin" : "/dashboard", label: "Dashboard" },
    { href: "/courses", label: "Catalogue" },
  ];

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const navLinks = links.map((link) => (
    <Link
      key={link.label}
      href={link.href}
      onClick={() => setMenuOpen(false)}
      aria-current={isActive(link.href) ? "page" : undefined}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
        isActive(link.href) && "bg-primary/10 font-semibold text-primary",
      )}
    >
      {link.label}
    </Link>
  ));

  const account = isLoading ? (
    <div className="h-10 w-44" aria-hidden="true" />
  ) : user ? (
    <Button variant="outline" onClick={signOut}>
      Log out
    </Button>
  ) : (
    <>
      <Link href="/sign-in" onClick={() => setMenuOpen(false)} className={buttonVariants({ variant: "outline" })}>
        Login
      </Link>
      <Link href="/sign-up" onClick={() => setMenuOpen(false)} className={buttonVariants()}>
        Register
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-white/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Logo />
   
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {navLinks}
        </nav>

        <div className="hidden items-center gap-2 justify-self-end lg:flex">{account}</div>

        <button
          type="button"
          className="rounded-md p-2 text-foreground hover:bg-muted lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-6" /> : <MenuIcon className="size-6" />}
        </button>
      </Container>

      {menuOpen && (
        <div id="mobile-menu" className="border-t bg-white lg:hidden">
          <Container className="py-4">
            <nav aria-label="Mobile" className="flex flex-col">
              {navLinks}
            </nav>
            <div className="mt-4 flex flex-col gap-2 border-t pt-4 [&>*]:w-full">{account}</div>
          </Container>
        </div>
      )}
    </header>
  );
}