import Link from "next/link";
import { Hero } from "@/components/Hero";
import { HomeSections } from "@/components/HomeSections";
import { KitchenReel } from "@/components/KitchenReel";
import { Marquee } from "@/components/Marquee";
import { db } from "@/lib/db";

export const revalidate = 300;

export default async function HomePage() {
  const featured = await db.menuItem.findMany({
    where: { active: true, badges: { contains: "popular" } },
    orderBy: { sort: "asc" },
    take: 6,
    include: { category: true },
  });

  return (
    <>
      <Hero />
      <Marquee />
      <HomeSections
        featured={featured.map((i) => ({
          id: i.id,
          slug: i.slug,
          nameFr: i.nameFr,
          nameEn: i.nameEn,
          descFr: i.descFr,
          descEn: i.descEn,
          priceCents: i.priceCents,
          image: i.image,
          categorySlug: i.category.slug,
        }))}
      />
      <KitchenReel />
      <section className="border-t border-cream/10 px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="display text-4xl sm:text-5xl">
            Prêt à <span className="ember-text">commander</span>?
          </h2>
          <p className="mt-4 text-cream/70">
            Livraison par Uber Direct partout dans NDG et les quartiers voisins, ou ramassage au comptoir.
          </p>
          <Link href="/menu" className="btn-ember mt-8 inline-block rounded-full px-9 py-3.5 text-sm">
            Voir le menu
          </Link>
        </div>
      </section>
    </>
  );
}
