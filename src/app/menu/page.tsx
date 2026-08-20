import { db } from "@/lib/db";
import { MenuBrowser } from "@/components/MenuBrowser";

export const revalidate = 60;
export const metadata = { title: "Menu" };

export default async function MenuPage() {
  const categories = await db.category.findMany({
    where: { active: true },
    orderBy: { sort: "asc" },
    include: {
      items: {
        where: { active: true },
        orderBy: { sort: "asc" },
        include: {
          optionGroups: { orderBy: { sort: "asc" }, include: { options: { orderBy: { sort: "asc" } } } },
        },
      },
    },
  });

  return <MenuBrowser categories={JSON.parse(JSON.stringify(categories))} />;
}
