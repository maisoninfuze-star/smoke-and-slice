/**
 * Mr Smoke Et Slice — the real menu.
 *
 * Transcribed from the restaurant's printed menu card (6 pages, scanned
 * 2026-08-19). Prices are in CENTS and match the card exactly.
 *
 * Sizing: pizzas are priced across five sizes (P/M/G/TG/XXL) and poutines
 * across two (S/L). The card's own prices are written out below in dollars and
 * the size surcharges are derived from them, so this file can be diffed
 * directly against the printed menu. The item's base price is the smallest size.
 *
 * After editing:  npm run db:reset
 */

export type SeedOption = { nameFr: string; nameEn: string; priceCents?: number };
export type SeedOptionGroup = {
  nameFr: string;
  nameEn: string;
  minSelect?: number;
  maxSelect?: number;
  options: SeedOption[];
};
export type SeedItem = {
  slug: string;
  nameFr: string;
  nameEn: string;
  descFr?: string;
  descEn?: string;
  priceCents: number;
  badges?: string;
  image?: string;
  optionGroups?: SeedOptionGroup[];
};
export type SeedCategory = {
  slug: string;
  nameFr: string;
  nameEn: string;
  descFr?: string;
  descEn?: string;
  items: SeedItem[];
};

const d = (dollars: number) => Math.round(dollars * 100);

/** "Add fries and a drink for $3.99" — burgers, subs and wraps. */
const COMBO: SeedOptionGroup = {
  nameFr: "Ajoutez des frites et une boisson",
  nameEn: "Add fries and a drink",
  minSelect: 0,
  maxSelect: 1,
  options: [{ nameFr: "Frites + boisson", nameEn: "Fries + drink", priceCents: d(3.99) }],
};

/** Printed on the parmesan and calzone sections. */
const TOPPINGS: SeedOptionGroup = {
  nameFr: "Suppléments",
  nameEn: "Extra toppings",
  minSelect: 0,
  maxSelect: 8,
  options: [
    { nameFr: "Viande supplémentaire", nameEn: "Extra meat", priceCents: d(2.99) },
    { nameFr: "Légume supplémentaire", nameEn: "Extra veggie", priceCents: d(1.99) },
  ],
};

const WING_SAUCE: SeedOptionGroup = {
  nameFr: "Sauce",
  nameEn: "Sauce",
  minSelect: 1,
  maxSelect: 1,
  options: [
    { nameFr: "BBQ", nameEn: "BBQ" },
    { nameFr: "Buffalo", nameEn: "Buffalo" },
    { nameFr: "Aigre-doux", nameEn: "Sweet & sour" },
  ],
};

/** Five-size pizza ladder. Pass the card's dollar prices in order. */
function pizzaSizes(p: number, m: number, g: number, tg: number, xxl: number): SeedOptionGroup {
  return {
    nameFr: "Grandeur",
    nameEn: "Size",
    minSelect: 1,
    maxSelect: 1,
    options: [
      { nameFr: "Petite", nameEn: "Small", priceCents: 0 },
      { nameFr: "Moyenne", nameEn: "Medium", priceCents: d(m) - d(p) },
      { nameFr: "Grande", nameEn: "Large", priceCents: d(g) - d(p) },
      { nameFr: "Très grande", nameEn: "X-Large", priceCents: d(tg) - d(p) },
      { nameFr: "XXL", nameEn: "XXL", priceCents: d(xxl) - d(p) },
    ],
  };
}

function poutineSizes(s: number, l: number): SeedOptionGroup {
  return {
    nameFr: "Grandeur",
    nameEn: "Size",
    minSelect: 1,
    maxSelect: 1,
    options: [
      { nameFr: "Petite", nameEn: "Small", priceCents: 0 },
      { nameFr: "Grande", nameEn: "Large", priceCents: d(l) - d(s) },
    ],
  };
}

/** Photography for the pizza table. Kept as a map rather than inlined in the
 *  tuple rows so the price ladder stays readable next to the printed card. */
const PIZZA_IMAGES: Record<string, string> = {
  "margherita": "/media/auto-margherita.jpg",
  "margherita-ail": "/media/auto-margherita-ail.jpg",
  "al-fungi": "/media/auto-al-fungi.jpg",
  "vegetarienne": "/media/dish-pizza-veg.jpg",
  "vegetarienne-speciale": "/media/auto-vegetarienne-speciale.jpg",
  "pepperoni": "/media/dish-pizza-pepperoni.jpg",
  "meat-feast": "/media/auto-meat-feast.jpg",
  "toute-garnie": "/media/pizza-all-dressed.jpg",
  "hot-and-spicy": "/media/pizza-chicken.jpg",
  "meat-lover": "/media/auto-meat-lover.jpg",
  "pollo": "/media/real-pizza-chicken.jpg",
  "pollo-fungi": "/media/auto-pollo-fungi.jpg",
  "tropicana": "/media/auto-tropicana.jpg",
  "hot-shot-pizza": "/media/auto-hot-shot-pizza.jpg",
  "quebecoise": "/media/auto-quebecoise.jpg",
  "deluxe-pizza": "/media/auto-deluxe-pizza.jpg",
  "toscana": "/media/auto-toscana.jpg",
  "mexicaine": "/media/auto-mexicaine.jpg",
  "hawaienne": "/media/auto-hawaienne.jpg",
  "chicken-chilli": "/media/auto-chicken-chilli.jpg",
  "beef-chilli": "/media/auto-beef-chilli.jpg",
  "florantina": "/media/auto-florantina.jpg",
  "marinara": "/media/auto-marinara.jpg",
  "fromage-oignons": "/media/auto-fromage-oignons.jpg",
  "poulet-grille-pizza": "/media/auto-poulet-grille-pizza.jpg",
  "bbq-pizza": "/media/auto-bbq-pizza.jpg",
  "crevettes": "/media/auto-crevettes.jpg",
};

/** Pizza rows: [slug, fr, en, descFr, descEn, badges, P, M, G, TG, XXL] */
const PIZZAS: [string, string, string, string, string, string, number, number, number, number, number][] = [
  ["margherita", "Margherita", "Margherita", "fromage", "cheese", "vegetarian", 12.99, 15.99, 19.99, 24.99, 30.99],
  ["margherita-ail", "Margherita à l'ail", "Garlic Margherita", "ail, fromage", "garlic, cheese", "vegetarian", 13.99, 16.99, 20.99, 25.99, 29.99],
  ["al-fungi", "Al Fungi", "Al Fungi", "tomates, champignons", "tomatoes, mushrooms", "vegetarian", 14.99, 17.99, 20.99, 24.99, 29.99],
  ["vegetarienne", "Végétarienne", "Vegetarian", "poivrons verts, oignons, olives, champignons, tomates", "green peppers, onions, olives, mushrooms, tomatoes", "vegetarian", 15.99, 19.99, 23.99, 28.99, 34.99],
  ["vegetarienne-speciale", "Végétarienne spéciale", "Vegetarian Special", "poivrons, oignons, champignons, maïs sucré, ananas", "peppers, onions, mushrooms, sweetcorn, pineapple", "vegetarian", 16.99, 20.99, 24.99, 29.99, 36.99],
  ["pepperoni", "Pepperoni", "Pepperoni", "pepperoni", "pepperoni", "popular", 16.99, 20.99, 24.99, 29.99, 36.99],
  ["meat-feast", "Meat Feast", "Meat Feast", "pepperoni, bœuf haché, poulet", "pepperoni, minced beef, chicken", "popular", 18.99, 22.99, 27.99, 32.99, 40.99],
  ["toute-garnie", "Toute garnie", "All Dressed", "pepperoni, champignons, poivrons verts", "pepperoni, mushrooms, green peppers", "popular", 17.99, 21.99, 26.99, 31.99, 39.99],
  ["hot-and-spicy", "Hot & Spicy", "Hot & Spicy", "poulet, poivrons verts, oignons, piments verts", "chicken, green peppers, onions, green chillies", "spicy", 15.99, 18.99, 22.99, 26.99, 32.99],
  ["meat-lover", "Meat Lover", "Meat Lover", "pepperoni, jambon, bacon", "pepperoni, ham, bacon", "", 21.99, 24.99, 28.99, 32.99, 40.99],
  ["pollo", "Pollo", "Pollo", "poulet, maïs sucré", "chicken, sweetcorn", "", 14.99, 17.99, 20.99, 24.99, 30.99],
  ["pollo-fungi", "Pollo Fungi", "Pollo Fungi", "poulet, maïs sucré, champignons", "chicken, sweetcorn, mushrooms", "", 15.99, 18.99, 21.99, 25.99, 31.99],
  ["tropicana", "Tropicana", "Tropicana", "poulet, ananas, maïs sucré", "chicken, pineapple, sweetcorn", "", 15.99, 18.99, 21.99, 25.99, 31.99],
  ["hot-shot-pizza", "Hot Shot", "Hot Shot", "pepperoni, oignons, flocons de chili, poivrons verts", "pepperoni, onions, chilli flakes, green peppers", "spicy", 17.99, 21.99, 26.99, 31.99, 39.99],
  ["quebecoise", "Québécoise", "Quebecoise", "pepperoni, bacon, champignons", "pepperoni, bacon, mushrooms", "", 19.99, 23.99, 29.99, 34.99, 41.99],
  ["deluxe-pizza", "Deluxe", "Deluxe", "pepperoni, bacon, oignons, champignons, poivrons verts", "pepperoni, bacon, onions, mushrooms, green peppers", "", 18.99, 22.99, 28.99, 33.99, 39.99],
  ["toscana", "Toscana", "Toscana", "pepperoni, champignons, oignons", "pepperoni, mushrooms, onions", "", 17.99, 21.99, 26.99, 31.99, 39.99],
  ["mexicaine", "Mexicaine", "Mexican", "bœuf haché, oignons, olives, jalapeños", "minced beef, onions, olives, jalapeños", "spicy", 17.99, 21.99, 24.99, 29.99, 34.99],
  ["hawaienne", "Hawaïenne", "Hawaiian", "jambon, ananas", "ham, pineapple", "", 15.99, 18.99, 22.99, 26.99, 31.99],
  ["chicken-chilli", "Chicken Chilli", "Chicken Chilli", "poulet, poivrons verts, piments verts, jalapeños, piments bananes", "chicken, green peppers, green chillies, jalapeños, banana peppers", "spicy", 18.99, 22.99, 28.99, 33.99, 39.99],
  ["beef-chilli", "Beef Chilli", "Beef Chilli", "bœuf, poivrons verts, piments verts, jalapeños, piments bananes", "beef, green peppers, green chillies, jalapeños, banana peppers", "spicy", 19.99, 23.99, 29.99, 34.99, 41.99],
  ["florantina", "Florantina", "Florantina", "thon, maïs sucré", "tuna, sweetcorn", "", 15.99, 18.99, 21.99, 25.99, 31.99],
  ["marinara", "Marinara", "Marinara", "thon, crevettes", "tuna, prawns", "", 16.99, 20.99, 24.99, 29.99, 36.99],
  ["fromage-oignons", "Fromage & oignons", "Cheese & Onion", "oignons caramélisés", "caramelised onions", "vegetarian", 13.99, 16.99, 20.99, 25.99, 29.99],
  ["poulet-grille-pizza", "Poulet grillé", "Grilled Chicken", "poulet grillé, oignons, poivrons verts, olives", "grilled chicken, onions, green peppers, olives", "", 16.99, 19.99, 24.99, 29.99, 34.99],
  ["bbq-pizza", "B.B.Q.", "B.B.Q.", "sauce BBQ, poulet grillé, oignons, poivrons verts", "bbq sauce, grilled chicken, onions, green peppers", "", 16.99, 19.99, 24.99, 29.99, 34.99],
  ["crevettes", "Crevettes", "Shrimp", "crevettes, tomates, poivrons verts, oignons", "prawns, tomatoes, green peppers, onions", "", 18.99, 23.99, 28.99, 33.99, 39.99],
];

export const MENU: SeedCategory[] = [
  {
    slug: "hamburger",
    nameFr: "Hamburger",
    nameEn: "Hamburger",
    descFr: "Ajoutez des frites et une boisson pour 3,99 $",
    descEn: "Add fries and a drink for $3.99",
    items: [
      { slug: "l-og", nameFr: "L'OG", nameEn: "The OG", descFr: "Filet de poulet, laitue, tomates, oignon, mayonnaise", descEn: "Chicken fillet, lettuce, tomatoes, onion, mayonnaise", priceCents: d(8.99), image: "/media/auto-l-og.jpg", optionGroups: [COMBO] },
      { slug: "double-trouble", nameFr: "Double Trouble", nameEn: "Double Trouble", descFr: "2 filets de poulet, laitue, tomates, oignon, mayonnaise", descEn: "2 x chicken fillet, lettuce, tomatoes, onion, mayonnaise", priceCents: d(11.99), image: "/media/auto-double-trouble.jpg", optionGroups: [COMBO] },
      { slug: "flex", nameFr: "Flex", nameEn: "Flex", descFr: "3 filets de poulet, cheddar, laitue, tomates, oignon, mayonnaise", descEn: "3 x chicken fillet, cheddar, lettuce, tomatoes, onion, mayonnaise", priceCents: d(14.99), image: "/media/auto-flex.jpg", optionGroups: [COMBO] },
      { slug: "the-bacon", nameFr: "Bacon", nameEn: "The Bacon", descFr: "Poulet, bacon, laitue, tomates, oignon, sauce du chef, cheddar", descEn: "Chicken fillet, bacon, lettuce, tomatoes, onion, chef sauce, cheddar", priceCents: d(11.99), image: "/media/auto-the-bacon.jpg", optionGroups: [COMBO] },
      { slug: "beef-mode", nameFr: "Beef Mode", nameEn: "Beef Mode", descFr: "2 steaks hachés de 80 g, cheddar, laitue, tomates, oignon, sauce maison", descEn: "2 x beef patty 80g, cheddar, lettuce, tomatoes, onion, house sauce", priceCents: d(9.99), badges: "popular", image: "/media/dish-burger-double.jpg", optionGroups: [COMBO] },
      { slug: "king-kong", nameFr: "King Kong", nameEn: "King Kong", descFr: "3 steaks hachés de 80 g, bacon, cheddar, laitue, tomates, oignon, sauce maison", descEn: "3 x beef patty 80g, bacon, cheddar, lettuce, tomatoes, onion, house sauce", priceCents: d(14.99), image: "/media/dish-burger-stack.jpg", optionGroups: [COMBO] },
      { slug: "godzilla", nameFr: "Godzilla", nameEn: "Godzilla", descFr: "5 steaks hachés de 80 g, cheddar, laitue, tomates, oignons caramélisés, champignons, sauce du chef", descEn: "5 x beef patty 80g, cheddar, lettuce, tomatoes, caramelised onion, mushrooms, chef sauce", priceCents: d(19.99), image: "/media/auto-godzilla.jpg", badges: "popular", optionGroups: [COMBO] },
      { slug: "fatty-original", nameFr: "Le Fatty Original", nameEn: "The Original Fatty", descFr: "2 galettes de bœuf de 80 g, cheddar, laitue, tomates, oignons, cornichons, sauce maison", descEn: "2 x beef patty 80g, cheddar, lettuce, tomatoes, onion, pickles, house sauce", priceCents: d(10.99), image: "/media/auto-fatty-original.jpg", optionGroups: [COMBO] },
      { slug: "fat-cremeux-original", nameFr: "Le Fat Crémeux Original", nameEn: "The Original Creamy Fat", descFr: "2 galettes de bœuf de 80 g, fromage à la crème, cheddar, sauce maison, laitue, tomates, oignons, cornichons", descEn: "2 x beef patty 80g, cream cheese, cheddar, house sauce, lettuce, tomatoes, onions, pickles", priceCents: d(11.99), image: "/media/auto-fat-cremeux-original.jpg", optionGroups: [COMBO] },
      { slug: "du-chef", nameFr: "Du chef", nameEn: "From The Chef", descFr: "Galette de bœuf de 80 g, filet de poulet, cheddar, laitue, tomates, oignons caramélisés, champignons, sauce du chef", descEn: "Beef patty 80g, chicken fillet, cheddar, lettuce, tomatoes, caramelised onion, mushroom, chef sauce", priceCents: d(13.99), image: "/media/auto-du-chef.jpg", optionGroups: [COMBO] },
    ],
  },
  {
    slug: "sous-marin",
    nameFr: "Sous-marin",
    nameEn: "Submarine",
    descFr: "Ajoutez des frites et une boisson pour 3,99 $",
    descEn: "Add fries and a drink for $3.99",
    items: [
      { slug: "simple-cheddar", nameFr: "Le Simple Cheddar", nameEn: "The Simple Cheddar", descFr: "2 galettes de bœuf, cheddar, sauce maison, laitue, tomates, oignons", descEn: "2 x beef patty, cheddar, house sauce, salad, tomatoes, onions", priceCents: d(12.99), image: "/media/shop-submarine.jpg", optionGroups: [COMBO] },
      { slug: "le-vegetarien", nameFr: "Le Végétarien", nameEn: "The Vegetarian", descFr: "Sauce maison, laitue, tomates, oignons, cornichons, olives", descEn: "House sauce, lettuce, tomatoes, onions, pickles, olives", priceCents: d(10.99), image: "/media/auto-le-vegetarien.jpg", badges: "vegetarian", optionGroups: [COMBO] },
      { slug: "cheesy-chicken", nameFr: "Le Cheesy Chicken", nameEn: "The Cheesy Chicken", descFr: "Poulet, cheddar, sauce maison, laitue, oignons, cornichons", descEn: "Chicken, cheddar, house sauce, salad, onion, pickles", priceCents: d(11.99), image: "/media/dish-sub-chicken.jpg", optionGroups: [COMBO] },
      { slug: "cheddar-bacon", nameFr: "Le Cheddar Bacon", nameEn: "The Cheddar Bacon", descFr: "2 galettes de bœuf, bacon, cheddar, sauce maison, laitue, oignons, cornichons", descEn: "2 x beef patty, bacon, cheddar, house sauce, salad, onion, pickles", priceCents: d(13.99), image: "/media/auto-cheddar-bacon.jpg", optionGroups: [COMBO] },
      { slug: "le-creamy", nameFr: "Le Creamy", nameEn: "The Creamy", descFr: "Fromage à la crème, 2 galettes de bœuf, cheddar, sauce maison, laitue, oignons caramélisés", descEn: "Cream cheese, 2 x beef patty, cheddar, house sauce, salad, caramelised onions", priceCents: d(14.99), image: "/media/auto-le-creamy.jpg", optionGroups: [COMBO] },
    ],
  },
  {
    slug: "poulet-parmesan",
    nameFr: "Poulet Parmesan",
    nameEn: "Chicken Parmesan",
    descFr: "Base de poulet fraîchement préparée, garnie de sauce marinara et de mozzarella, servie avec des frites",
    descEn: "Freshly made chicken base topped with marinara sauce and mozzarella, served with fries",
    items: [
      { slug: "parm-original", nameFr: "L'original", nameEn: "The Original", priceCents: d(16.99), image: "/media/dish-chicken-parm.jpg", optionGroups: [TOPPINGS] },
      { slug: "parm-flamme-saveur", nameFr: "Flamme et saveur", nameEn: "Flame & Flavor", descFr: "Oignons, poivrons verts, piments verts", descEn: "Onion, green peppers, green chillies", priceCents: d(19.99), image: "/media/auto-parm-flamme-saveur.jpg", badges: "spicy", optionGroups: [TOPPINGS] },
      { slug: "parm-hot-shot", nameFr: "Hot Shot", nameEn: "Hot Shot", descFr: "Jalapeños, oignons, poivrons verts, piments verts, flocons de chili", descEn: "Jalapeños, onions, green peppers, green chillies, chili flakes", priceCents: d(18.99), image: "/media/auto-parm-hot-shot.jpg", badges: "spicy", optionGroups: [TOPPINGS] },
      { slug: "parm-pepperoni", nameFr: "Pepperoni", nameEn: "Pepperoni", descFr: "Pepperoni, poivrons verts", descEn: "Pepperoni, green peppers", priceCents: d(21.99), image: "/media/auto-parm-pepperoni.jpg", optionGroups: [TOPPINGS] },
      { slug: "parm-creez-votre", nameFr: "Créez votre", nameEn: "Create Your Own", descFr: "Choix de 3 garnitures", descEn: "Choice of 3 toppings", priceCents: d(20.99), image: "/media/auto-parm-creez-votre.jpg", optionGroups: [TOPPINGS] },
      { slug: "parm-zilla", nameFr: "Zilla", nameEn: "Zilla", descFr: "Oignons, poivrons verts, piments verts, bœuf haché, champignons", descEn: "Onions, green peppers, green chillies, minced beef, mushrooms", priceCents: d(23.99), image: "/media/auto-parm-zilla.jpg", badges: "spicy", optionGroups: [TOPPINGS] },
      { slug: "parm-smoke-slice", nameFr: "Smoke & Slice Spéciale", nameEn: "Smoke Et Slice Special", descFr: "Oignons, poivrons verts, jalapeños, maïs sucré, pepperoni, fines herbes maison", descEn: "Onion, green peppers, jalapeños, sweetcorn, pepperoni, house herbs", priceCents: d(25.99), image: "/media/auto-parm-smoke-slice.jpg", badges: "spicy,popular", optionGroups: [TOPPINGS] },
    ],
  },
  {
    slug: "calzone",
    nameFr: "Calzone",
    nameEn: "Calzone",
    descFr: "Pâte fraîche maison garnie de sauce tomate et de mozzarella",
    descEn: "Fresh homemade dough topped with tomato sauce & mozzarella",
    items: [
      { slug: "calzone-classique", nameFr: "Classique", nameEn: "Classic", descFr: "Jambon, bacon", descEn: "Ham, bacon", priceCents: d(17.99), image: "/media/shop-calzone.jpg", optionGroups: [TOPPINGS] },
      { slug: "calzone-pepperoni", nameFr: "Pepperoni", nameEn: "Pepperoni", descFr: "Pepperoni, bacon", descEn: "Pepperoni, bacon", priceCents: d(17.99), image: "/media/auto-calzone-pepperoni.jpg", optionGroups: [TOPPINGS] },
      { slug: "calzone-poulet-grille", nameFr: "Poulet grillé", nameEn: "Grilled Chicken", descFr: "Poulet grillé, oignons, poivrons verts, champignons", descEn: "Grilled chicken, onions, green peppers, mushrooms", priceCents: d(19.99), image: "/media/auto-calzone-poulet-grille.jpg", optionGroups: [TOPPINGS] },
      { slug: "calzone-boeuf", nameFr: "Bœuf", nameEn: "Beef", descFr: "Bœuf haché, oignons, poivrons verts, champignons", descEn: "Minced beef, onions, green peppers, mushrooms", priceCents: d(20.99), image: "/media/auto-calzone-boeuf.jpg", optionGroups: [TOPPINGS] },
      { slug: "calzone-shani", nameFr: "Shani Spéciale", nameEn: "Shani Special", descFr: "Bœuf haché épicé, oignons, jalapeños, champignons", descEn: "Spicy minced beef, onions, jalapeños, mushrooms", priceCents: d(22.99), image: "/media/auto-calzone-shani.jpg", badges: "spicy", optionGroups: [TOPPINGS] },
      { slug: "calzone-smoke-slice", nameFr: "Smoke & Slice Spéciale", nameEn: "Smoke Et Slice Special", descFr: "Oignons, poivrons verts, poulet, bœuf haché, pepperoni", descEn: "Onions, green peppers, chicken, minced beef, pepperoni", priceCents: d(24.99), image: "/media/auto-calzone-smoke-slice.jpg", badges: "spicy,popular", optionGroups: [TOPPINGS] },
    ],
  },
  {
    slug: "ailes-de-poulet",
    nameFr: "Ailes de poulet",
    nameEn: "Chicken Wings",
    descFr: "BBQ, Buffalo, Aigre-doux",
    descEn: "BBQ, Buffalo, Sweet & sour",
    items: [
      { slug: "wings-6", nameFr: "6 ailes de poulet", nameEn: "6 Wings", descFr: "Petite frite, 1 canette", descEn: "Small fries, a can", priceCents: d(11.99), image: "/media/shop-wings-fries.jpg", optionGroups: [WING_SAUCE] },
      { slug: "wings-12", nameFr: "12 ailes de poulet", nameEn: "12 Wings", descFr: "Frite moyenne, 2 canettes", descEn: "Medium fries, 2 cans", priceCents: d(19.99), badges: "popular", image: "/media/real-wings.jpg", optionGroups: [WING_SAUCE] },
      { slug: "wings-24", nameFr: "24 ailes de poulet", nameEn: "24 Wings", descFr: "Grande frite, 4 canettes", descEn: "Large fries, 4 cans", priceCents: d(34.99), image: "/media/auto-wings-24.jpg", optionGroups: [WING_SAUCE] },
    ],
  },
  {
    slug: "club-sandwich",
    nameFr: "Club Sandwich",
    nameEn: "Club Sandwich",
    descFr: "Servi avec des frites et une boisson",
    descEn: "Served with fries and a drink",
    items: [
      { slug: "club-classique", nameFr: "Classique", nameEn: "Classic", descFr: "Poulet grillé mariné, laitue, tomates", descEn: "Grilled marinated chicken, lettuce, tomatoes", priceCents: d(17.99), image: "/media/dish-club.jpg" },
      { slug: "club-deluxe", nameFr: "Deluxe", nameEn: "Deluxe", descFr: "Poulet grillé mariné, laitue, tomates, bacon", descEn: "Grilled marinated chicken, lettuce, tomatoes, bacon", priceCents: d(19.99), image: "/media/auto-club-deluxe.jpg" },
      { slug: "club-smoke-slice", nameFr: "Smoke & Slice Spéciale", nameEn: "Smoke Et Slice Special", descFr: "Poulet grillé mariné, laitue, tomates, bacon, œuf", descEn: "Grilled marinated chicken, lettuce, tomatoes, bacon, egg", priceCents: d(21.99), image: "/media/auto-club-smoke-slice.jpg", badges: "popular" },
    ],
  },
  {
    slug: "pizzas",
    nameFr: "Pizzas",
    nameEn: "Pizzas",
    descFr: "Suppléments de viande 2,99 $ chacun · Suppléments de légumes 1,99 $ chacun",
    descEn: "Extra meat toppings $2.99 each · Extra veggie toppings $1.99 each",
    items: [
      ...PIZZAS.map(([slug, nameFr, nameEn, descFr, descEn, badges, p, m, g, tg, xxl]) => ({
        slug,
        nameFr,
        nameEn,
        descFr,
        descEn,
        priceCents: d(p),
        badges,
        image: PIZZA_IMAGES[slug],
        optionGroups: [pizzaSizes(p, m, g, tg, xxl), TOPPINGS],
      })),
      {
        slug: "moitie-moitie",
        nameFr: "Moitié-moitié",
        nameEn: "Half & Half",
        descFr: "Choix de 2 pizzas — grande seulement",
        descEn: "Choice of any 2 pizzas — large only",
        priceCents: d(26.99),
        badges: "popular",
        image: "/media/real-pizza-half.jpg",
        optionGroups: [TOPPINGS],
      },
    ],
  },
  {
    slug: "poutine",
    nameFr: "Poutine",
    nameEn: "Poutine",
    items: [
      { slug: "poutine-classique", nameFr: "Classique", nameEn: "Classic", descFr: "Frites, fromage, sauce à poutine", descEn: "Fries, cheese, poutine sauce", priceCents: d(8.99), image: "/media/dish-poutine.jpg", badges: "popular", optionGroups: [poutineSizes(8.99, 10.99)] },
      { slug: "poutine-poulet", nameFr: "Poulet", nameEn: "Chicken", descFr: "Poulet, frites, fromage, sauce à poutine", descEn: "Chicken, fries, cheese, poutine sauce", priceCents: d(10.99), image: "/media/auto-poutine-poulet.jpg", optionGroups: [poutineSizes(10.99, 12.99)] },
      { slug: "poutine-vegetarienne", nameFr: "Végétarienne", nameEn: "Vegetarian", descFr: "Frites, fromage, sauce à poutine, poivrons verts, champignons, olives, oignons", descEn: "Fries, cheese, poutine sauce, green peppers, mushrooms, olives, onion", priceCents: d(9.99), image: "/media/auto-poutine-vegetarienne.jpg", badges: "vegetarian", optionGroups: [poutineSizes(9.99, 11.99)] },
      { slug: "poutine-boeuf", nameFr: "Bœuf", nameEn: "Beef", descFr: "Bœuf haché, frites, fromage, sauce à poutine", descEn: "Minced beef, fries, cheese, poutine sauce", priceCents: d(12.99), image: "/media/auto-poutine-boeuf.jpg", optionGroups: [poutineSizes(12.99, 14.99)] },
      { slug: "poutine-buffalo", nameFr: "Buffalo", nameEn: "Buffalo", descFr: "Bœuf haché épicé, frites, fromage, sauce à poutine, sauce maison épicée, jalapeños", descEn: "Spicy minced beef, fries, cheese, poutine sauce, spicy house sauce, jalapeños", priceCents: d(13.99), image: "/media/auto-poutine-buffalo.jpg", badges: "spicy", optionGroups: [poutineSizes(13.99, 15.99)] },
    ],
  },
  {
    slug: "wraps",
    nameFr: "Wraps",
    nameEn: "Wraps",
    descFr: "Ajoutez des frites et une boisson pour 3,99 $",
    descEn: "Add fries and a drink for $3.99",
    items: [
      { slug: "wrap-poulet-classique", nameFr: "Wrap poulet classique", nameEn: "Classic Chicken", descFr: "Poulet grillé, laitue, oignons, tomates, mayonnaise, ketchup", descEn: "Grilled chicken, lettuce, onions, tomatoes, mayonnaise, ketchup", priceCents: d(9.99), image: "/media/dish-wrap.jpg", optionGroups: [COMBO] },
      { slug: "wrap-chicc-a-tikka", nameFr: "Chicc-A-Tikka", nameEn: "Chicc-A-Tikka", descFr: "Poulet tikka, laitue, oignons, piments bananes, sauce du chef épicée", descEn: "Chicken tikka, lettuce, onions, banana peppers, spicy chef sauce", priceCents: d(10.99), image: "/media/auto-wrap-chicc-a-tikka.jpg", badges: "spicy", optionGroups: [COMBO] },
      { slug: "wrap-boeuf", nameFr: "Wrap au bœuf", nameEn: "Beef Wrap", descFr: "Bœuf haché, laitue, oignons, tomates, mayonnaise, ketchup", descEn: "Minced beef, lettuce, onions, tomatoes, mayonnaise, ketchup", priceCents: d(11.99), image: "/media/auto-wrap-boeuf.jpg", optionGroups: [COMBO] },
      { slug: "wrap-boeuf-epice", nameFr: "Bœuf épicé", nameEn: "Spicy Beef", descFr: "Bœuf haché épicé, laitue, oignons, olives, jalapeños, sauce du chef épicée", descEn: "Spicy minced beef, lettuce, onions, olives, jalapeños, spicy chef sauce", priceCents: d(12.99), image: "/media/auto-wrap-boeuf-epice.jpg", badges: "spicy", optionGroups: [COMBO] },
      { slug: "wrap-vege", nameFr: "Végé", nameEn: "Vege", descFr: "Laitue, oignons, piments bananes, frites croustillantes, sauce du chef épicée", descEn: "Lettuce, onions, banana peppers, crispy fries, spicy chef sauce", priceCents: d(8.99), image: "/media/auto-wrap-vege.jpg", badges: "vegetarian,spicy", optionGroups: [COMBO] },
    ],
  },
  {
    slug: "salades",
    nameFr: "Salades",
    nameEn: "Salads",
    items: [
      { slug: "salade-cesar", nameFr: "Salade César", nameEn: "Cesar Salad", descFr: "Laitue, croûtons, sauce César", descEn: "Lettuce, croutons, cesar sauce", priceCents: d(8.99), image: "/media/dish-salad-cesar.jpg", badges: "vegetarian" },
      { slug: "salade-cesar-poulet", nameFr: "Salade César au poulet", nameEn: "Chicken Cesar Salad", descFr: "Poulet grillé, laitue, croûtons, sauce César", descEn: "Grilled chicken, lettuce, croutons, cesar sauce", priceCents: d(13.99), image: "/media/auto-salade-cesar-poulet.jpg" },
      { slug: "salade-grecque", nameFr: "Salade grecque", nameEn: "Greek Salad", descFr: "Tomates, poivrons verts, oignons rouges, olives, feta", descEn: "Tomatoes, green peppers, red onions, olives, feta", priceCents: d(12.99), image: "/media/dish-salad-greek.jpg", badges: "vegetarian" },
    ],
  },
  {
    slug: "cotes",
    nameFr: "Côtés",
    nameEn: "Sides",
    items: [
      { slug: "petite-frite", nameFr: "Petite frite", nameEn: "Small Fries", priceCents: d(4.99), image: "/media/auto-petite-frite.jpg", badges: "vegetarian" },
      { slug: "grande-frite", nameFr: "Grande frite", nameEn: "Large Fries", priceCents: d(7.99), image: "/media/dish-fries.jpg", badges: "vegetarian" },
      { slug: "croquettes-poulet", nameFr: "Croquettes de poulet", nameEn: "Chicken Nuggets", descFr: "Servies avec frites", descEn: "Served with fries", priceCents: d(7.99), image: "/media/dish-nuggets.jpg" },
      { slug: "bouchees-fromage", nameFr: "Bouchées au fromage", nameEn: "Cheesy Bites", priceCents: d(7.99), image: "/media/auto-bouchees-fromage.jpg", badges: "vegetarian" },
      { slug: "pain-a-l-ail", nameFr: "Pain à l'ail", nameEn: "Garlic Bread", descFr: "Pain frais de 10 po garni de pâte d'ail fraîche", descEn: '10" fresh bread topped with fresh garlic paste', priceCents: d(7.99), image: "/media/auto-pain-a-l-ail.jpg", badges: "vegetarian" },
      { slug: "pain-ail-gratine", nameFr: "Pain à l'ail gratiné", nameEn: "Cheesy Garlic Bread", descFr: "Pain frais de 10 po garni de pâte d'ail fraîche et de mozzarella", descEn: '10" fresh bread topped with fresh garlic paste and mozzarella', priceCents: d(9.99), image: "/media/dish-garlic-bread.jpg", badges: "vegetarian" },
      { slug: "rondelles-oignon", nameFr: "Rondelles d'oignon", nameEn: "Onion Rings", priceCents: d(6.99), image: "/media/dish-onion-rings.jpg", badges: "vegetarian" },
      { slug: "frites-patates-douces", nameFr: "Frites de patates douces", nameEn: "Sweet Potato Fries", priceCents: d(7.99), image: "/media/auto-frites-patates-douces.jpg", badges: "vegetarian" },
    ],
  },
  {
    slug: "breuvages",
    nameFr: "Breuvages",
    nameEn: "Drinks",
    items: [
      { slug: "coke", nameFr: "Coke", nameEn: "Coke", priceCents: d(1.99) },
      { slug: "coke-diete", nameFr: "Coke diète", nameEn: "Diet Coke", priceCents: d(1.99) },
      { slug: "7up", nameFr: "7UP", nameEn: "7up", priceCents: d(1.99) },
      { slug: "7up-zero", nameFr: "7UP Zéro", nameEn: "7up Zero", priceCents: d(1.99) },
      { slug: "ginger-ale", nameFr: "Ginger Ale", nameEn: "Ginger Ale", priceCents: d(1.99) },
      { slug: "cream-soda", nameFr: "Cream Soda", nameEn: "Cream Soda", priceCents: d(1.99) },
      { slug: "crush-raisin", nameFr: "Crush raisin", nameEn: "Crush Raisin", priceCents: d(1.99) },
      { slug: "crush-orange", nameFr: "Crush orange", nameEn: "Orange Crush", priceCents: d(1.99) },
      { slug: "root-beer", nameFr: "Root Beer", nameEn: "Root Beer", priceCents: d(1.99) },
      { slug: "eau", nameFr: "Eau", nameEn: "Water", priceCents: d(1.99) },
      {
        slug: "gatorade",
        nameFr: "Gatorade",
        nameEn: "Gatorade",
        priceCents: d(3.99),
        optionGroups: [
          {
            nameFr: "Saveur",
            nameEn: "Flavour",
            minSelect: 1,
            maxSelect: 1,
            options: [
              { nameFr: "Rouge", nameEn: "Red" },
              { nameFr: "Orange", nameEn: "Orange" },
              { nameFr: "Jaune", nameEn: "Yellow" },
              { nameFr: "Bleu", nameEn: "Blue" },
            ],
          },
        ],
      },
    ],
  },
];
