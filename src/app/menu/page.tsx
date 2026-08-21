import { getMenu } from "@/lib/menu";
import { MenuBrowser } from "@/components/MenuBrowser";

// The menu comes from a file, so this page is fully static.
export const dynamic = "force-static";
export const metadata = { title: "Menu" };

export default function MenuPage() {
  return <MenuBrowser categories={getMenu()} />;
}
