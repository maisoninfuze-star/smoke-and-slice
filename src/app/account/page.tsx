import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AccountView } from "@/components/AccountView";

export const metadata = { title: "Mon compte / Account" };
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
    <AccountView
      user={{ name: user.name, email: user.email, role: user.role }}
      orders={orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        fulfilment: o.fulfilment,
        itemCount: o.items.length,
        totalCents: o.totalCents,
        createdAt: o.createdAt.toISOString(),
      }))}
    />
  );
}
