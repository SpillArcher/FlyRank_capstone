"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-ink hover:text-signal"
        >
          FlyRankAI
        </Link>

        <button
          type="button"
          className="text-ink hover:text-signal md:hidden"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? "Close" : "Menu"}
        </button>

        <ul
          id="primary-nav"
          className="hidden gap-6 font-mono text-sm uppercase tracking-wide md:flex"
        >
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-ink/70 hover:text-signal">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {open && (
        <ul className="flex flex-col gap-1 border-t border-border px-6 pb-4 font-mono text-sm uppercase tracking-wide md:hidden">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block py-2 text-ink/70 hover:text-signal"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
