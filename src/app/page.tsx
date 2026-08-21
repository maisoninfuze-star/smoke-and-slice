import Link from "next/link";
import { Hero } from "@/components/Hero";
import { HomeSections } from "@/components/HomeSections";
import { KitchenReel } from "@/components/KitchenReel";
import { Marquee } from "@/components/Marquee";
import { getFeatured } from "@/lib/menu";

export const revalidate = 300;

export default function HomePage() {
  const featured = getFeatured();

  return (
    <>
      <Hero />
      <Marquee />
      <HomeSections
        featured={featured}
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
