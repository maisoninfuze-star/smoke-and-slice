import { db, safeQuery } from "@/lib/db";
import { MenuBrowser } from "@/components/MenuBrowser";

export const revalidate = 60;
export const metadata = { title: "Menu" };

export default async function MenuPage() {
  const categories = await safeQuery(
    () => db.category.findMany({
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
  }),
    [],
    "menu categories"
  );

  return <MenuBrowser categories={JSON.parse(JSON.stringify(categories))} />;
}
