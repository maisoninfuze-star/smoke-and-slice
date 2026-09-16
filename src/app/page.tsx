import { Hero } from "@/components/Hero";
import { HomeSections } from "@/components/HomeSections";
import { OrderCta } from "@/components/OrderCta";
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
      <OrderCta />
    </>
  );
}
