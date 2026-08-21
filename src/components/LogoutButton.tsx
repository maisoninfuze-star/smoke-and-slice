"use client";

import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { t } from "@/lib/i18n";

export function LogoutButton() {
  const router = useRouter();
  const { lang } = useCart();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className="btn-ghost rounded-full px-5 py-2.5 text-sm"
    >
      {t(lang).nav.logout}
    </button>
  );
}
