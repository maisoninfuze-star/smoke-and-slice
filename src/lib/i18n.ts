export type Lang = "fr" | "en";

export const dict = {
  fr: {
    nav: { menu: "Menu", order: "Commander", track: "Suivi", account: "Mon compte", admin: "Gestion", login: "Connexion", logout: "Déconnexion", signup: "Créer un compte" },
    hero: {
      eyebrow: "Halal · NDG · Montréal",
      title: "Grillé au feu.\nServi brûlant.",
      sub: "Burgers smashés, pizzas à croûte fine et poulet grillé sur flamme vive — sur Sherbrooke Ouest depuis toujours.",
      cta: "Commander maintenant",
      ctaSecondary: "Voir le menu",
      rating: "sur Google",
    },
    common: {
      addToCart: "Ajouter", cart: "Panier", empty: "Votre panier est vide", checkout: "Passer la commande",
      subtotal: "Sous-total", delivery: "Livraison", tip: "Pourboire", tps: "TPS (5 %)", tvq: "TVQ (9,975 %)",
      total: "Total", pickup: "Ramassage", deliveryMode: "Livraison", from: "à partir de", each: "ch.",
      continue: "Continuer", back: "Retour", loading: "Chargement…", free: "Gratuit",
    },
    badges: { halal: "Halal", spicy: "Épicé", popular: "Populaire", new: "Nouveau", vegetarian: "Végé" },
    footer: { hours: "Heures d'ouverture", contact: "Nous joindre", tagline: "L'amour à la première slice" },
  },
  en: {
    nav: { menu: "Menu", order: "Order", track: "Track", account: "Account", admin: "Admin", login: "Log in", logout: "Log out", signup: "Sign up" },
    hero: {
      eyebrow: "Halal · NDG · Montréal",
      title: "Fire grilled.\nServed blazing.",
      sub: "Smashed burgers, thin-crust pizza and open-flame chicken — on Sherbrooke West, the way it's always been.",
      cta: "Order now",
      ctaSecondary: "See the menu",
      rating: "on Google",
    },
    common: {
      addToCart: "Add", cart: "Cart", empty: "Your cart is empty", checkout: "Place order",
      subtotal: "Subtotal", delivery: "Delivery", tip: "Tip", tps: "GST (5%)", tvq: "QST (9.975%)",
      total: "Total", pickup: "Pickup", deliveryMode: "Delivery", from: "from", each: "ea.",
      continue: "Continue", back: "Back", loading: "Loading…", free: "Free",
    },
    badges: { halal: "Halal", spicy: "Spicy", popular: "Popular", new: "New", vegetarian: "Veg" },
    footer: { hours: "Hours", contact: "Contact", tagline: "Love at first slice" },
  },
} as const;

export function t(lang: Lang) {
  return dict[lang];
}

export function pickName(lang: Lang, fr: string, en: string): string {
  return lang === "fr" ? fr : en;
}
