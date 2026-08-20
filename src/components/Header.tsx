"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";
import { CartDrawer } from "./CartDrawer";
import { t } from "@/lib/i18n";
import { STORE } from "@/lib/store";

type Me = { id: string; name: string; role: string } | null;

export function Header() {
  const { count, lang, setLang, hydrated } = useCart();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [me, setMe] = useState<Me>(null);
  const pathname = usePathname();
  const copy = t(lang);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setMe(d.user ?? null))
      .catch(() => setMe(null));
  }, [pathname]);

  useEffect(() => setMenuOpen(false), [pathname]);

  const links = [
    { href: "/menu", label: copy.nav.menu },
    { href: "/track", label: copy.nav.track },
  ];

  return (
    <>
      <div className="strip ember-bg text-charcoal-deep text-[10px] sm:text-xs py-1.5 text-center">
        Hamburger • Pizza • Grillée au feu • Fire Grilled •{" "}
        <a href={`tel:${STORE.phone}`} className="underline underline-offset-2">
          {STORE.phoneDisplay}
        </a>
      </div>

      <header className="sticky top-0 z-40 border-b border-cream/10 bg-charcoal-deep/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/" className="flex flex-col leading-none shrink-0">
            <span className="sign text-sm text-gold tracking-[0.2em]">MR</span>
            <span className="sign text-lg">
              <span className="text-cream">SMOKE</span>
              <span className="text-flame"> ET </span>
              <span className="text-cream">SLICE</span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-6 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`accent text-sm transition-colors hover:text-gold ${
                  pathname.startsWith(l.href) ? "text-gold" : "text-cream/80"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {me?.role === "ADMIN" && (
              <Link href="/admin" className="accent text-sm text-ember hover:text-gold">
                {copy.nav.admin}
              </Link>
            )}
            <Link
              href={me ? "/account" : "/login"}
              className="accent text-sm text-cream/80 transition-colors hover:text-gold"
            >
              {me ? me.name.split(" ")[0] : copy.nav.login}
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <div className="flex overflow-hidden rounded-full border border-cream/20 text-[11px]">
              {(["fr", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`accent px-2.5 py-1 transition-colors ${
                    lang === l ? "ember-bg text-charcoal-deep" : "text-cream/70 hover:text-gold"
                  }`}
                  aria-pressed={lang === l}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={() => setOpen(true)}
              className="relative rounded-full border border-cream/20 p-2 transition-colors hover:border-gold"
              aria-label={copy.common.cart}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 6h15l-1.5 9h-12z" />
                <circle cx="9" cy="20" r="1.4" fill="currentColor" />
                <circle cx="18" cy="20" r="1.4" fill="currentColor" />
                <path d="M6 6 5 2H2" />
              </svg>
              {hydrated && count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full ember-bg px-1 accent text-[11px] text-charcoal-deep">
                  {count}
                </span>
              )}
            </button>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-full border border-cream/20 p-2 md:hidden"
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d={menuOpen ? "M5 5l14 14M19 5 5 19" : "M4 7h16M4 12h16M4 17h16"} />
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="flex flex-col gap-1 border-t border-cream/10 px-4 py-3 md:hidden">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="accent py-2 text-cream/85 hover:text-gold">
                {l.label}
              </Link>
            ))}
            {me?.role === "ADMIN" && (
              <Link href="/admin" className="accent py-2 text-ember">
                {copy.nav.admin}
              </Link>
            )}
            <Link href={me ? "/account" : "/login"} className="accent py-2 text-cream/85 hover:text-gold">
              {me ? copy.nav.account : copy.nav.login}
            </Link>
          </nav>
        )}
      </header>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
