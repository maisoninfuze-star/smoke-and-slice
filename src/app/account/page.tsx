import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { LogoutButton } from "@/components/LogoutButton";

export const metadata = { title: "Mon compte" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 25,
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="display text-4xl">
            Bonjour, <span className="ember-text">{user.name.split(" ")[0]}</span>
          </h1>
          <p className="mt-2 text-sm text-smoke">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {user.role === "ADMIN" && (
            <Link href="/admin" className="btn-ghost rounded-full px-5 py-2.5 text-sm">
              Gestion
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>

      <h2 className="accent mt-12 text-sm text-gold">Mes commandes</h2>

      {orders.length === 0 ? (
        <div className="card mt-4 p-8 text-center">
          <p className="text-smoke">Aucune commande pour l&apos;instant.</p>
          <Link href="/menu" className="btn-ember mt-5 inline-block rounded-full px-6 py-2.5 text-sm">
            Voir le menu
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/track/${o.orderNumber}`} className="card card-hover flex items-center gap-4 p-4">
                <div className="flex-1">
                  <p className="accent text-gold">{o.orderNumber}</p>
                  <p className="mt-0.5 text-sm text-cream/75">
                    {o.items.length} article{o.items.length > 1 ? "s" : ""} ·{" "}
                    {o.fulfilment === "PICKUP" ? "Ramassage" : "Livraison"} ·{" "}
                    {new Date(o.createdAt).toLocaleDateString("fr-CA")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="accent">{formatMoney(o.totalCents, "fr")}</p>
                  <p className="mt-0.5 text-xs text-smoke">{o.status}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
