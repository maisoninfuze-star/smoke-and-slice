/**
 * Builds a photo brief for every menu item that still lacks one.
 *
 * Rather than hand-writing prompts, each is composed from three things:
 *   1. a per-category framing template (how that kind of food is served here)
 *   2. the item's OWN ingredient list, straight out of prisma/menu-data.ts
 *   3. the shared lighting/surface LOOK, so the whole library is one shoot
 *
 * Grounding in the real description matters twice over: the photo shows what the
 * customer will actually be handed, and naming concrete ingredients keeps the
 * model from inventing garnish. (FLUX largely ignores negative_prompt — see
 * menu-brief.ts — so everything that must not appear has to be crowded out by
 * describing what does.)
 *
 * The angle is chosen from the item's index so no two neighbouring cards share
 * a camera position; a grid of identical three-quarter shots is the fastest way
 * to make a real menu look synthetic.
 */
import { MENU } from "../src/data/menu-data.js";

const LOOK =
  "Shot on a Canon EOS R5, 50mm f/1.4 at f/2.0. Single warm tungsten key from " +
  "camera left, deep shadow falloff into near-black on the right, dark walnut " +
  "table surface, slight sensor grain, framing very slightly off-level. " +
  "Natural and photographic, not advertising, not a render. No hands, no people.";

const ANGLES = [
  "shot at eye level from the side",
  "shot from a low three-quarter angle",
  "shot from directly overhead",
  "shot from a high three-quarter angle",
  "shot at eye level in a tight crop",
];

type Tmpl = (name: string, ing: string, angle: string) => string;

const TEMPLATES: Record<string, Tmpl> = {
  hamburger: (n, i, a) =>
    `A "${n}" burger sitting on white deli paper on a dark walnut table, ${a}. ` +
    `It is built from exactly these and nothing else: ${i}. The patties have ` +
    `lacy browned edges, the cheese is unevenly melted, the toasted bun is ` +
    `slightly squashed on one side and a grease spot has soaked through the paper.`,

  "sous-marin": (n, i, a) =>
    // Must read unmistakably as a long sub, not a burger bun — the first pass
    // produced short round rolls that were indistinguishable from the burgers.
    `A "${n}" submarine sandwich built in a LONG twelve-inch torpedo roll — a ` +
    `narrow elongated baguette-style bread at least four times longer than it is ` +
    `wide, sliced lengthways along the top — lying full-length on white deli ` +
    `paper on a dark walnut table, ${a}, filling visible along the whole length ` +
    `of the split. The filling running end to end is exactly: ${i}. Sauce has run ` +
    `out onto the paper. It is a long sub, not a round burger bun.`,

  "poulet-parmesan": (n, i, a) =>
    `A "${n}" chicken parmesan on a plain white diner plate with a pile of golden ` +
    `fries beside it, ${a}. A breaded chicken cutlet under bright red marinara and ` +
    `browned melted mozzarella, topped with: ${i}. The cheese is unevenly browned ` +
    `with a few dark blistered spots and a smear of sauce sits on the plate rim.`,

  calzone: (n, i, a) =>
    `A "${n}" calzone — a folded, sealed half-moon of baked pizza dough with a ` +
    `crimped edge — on a scratched round aluminium pan on a dark walnut table, ${a}. ` +
    `A second calzone beside it is cut open, spilling its filling of: ${i}. The ` +
    `crust is golden and blistered unevenly, brushed with a little oil, with the ` +
    `faintest trace of flour at the crimped edge only.`,

  "ailes-de-poulet": (n, i, a) =>
    `A portion of grilled chicken wings in a black takeout container on a dark ` +
    `walnut table, ${a}, with ${i}. The skin is blistered and charred unevenly, ` +
    `some pieces darker than others, glossy with sauce, a little spice dust ` +
    `fallen in the container.`,

  "club-sandwich": (n, i, a) =>
    `A "${n}" club sandwich cut into triangles and stacked leaning against each ` +
    `other on a white plate with fries filling the rest of the plate, ${a}. The ` +
    `layers show: ${i}. Toothpicks hold the stack, one triangle sits crooked.`,

  pizzas: (n, i, a) =>
    `A thin-crust "${n}" pizza on a scratched round aluminium pizza pan on a dark ` +
    `walnut table, ${a}. The toppings are exactly: ${i} — scattered unevenly and ` +
    `heavier on one side, over browned mozzarella with dark blistered spots. The ` +
    `crust is puffed irregularly and charred in places. One slice is cut and ` +
    `shifted slightly out of place.`,

  poutine: (n, i, a) =>
    `A "${n}" poutine in a black plastic takeout container on a dark walnut table, ` +
    `${a}. Golden fries under glossy brown gravy with chunks of fresh cheese torn ` +
    `by hand from a block — jagged shards and ragged pieces, every one a different ` +
    `size, half sunk and melting at the edges. Also on it: ${i}. Gravy has run ` +
    `down one side. A plastic fork rests beside it.`,

  wraps: (n, i, a) =>
    `A "${n}" wrap cut in half on the diagonal, both halves standing cut-face up ` +
    `on white deli paper on a dark walnut table, ${a}, so the filling shows. The ` +
    `filling is exactly: ${i}, inside a soft flour tortilla with light grill ` +
    `marks. A little sauce has squeezed out onto the paper.`,

  salades: (n, i, a) =>
    `A "${n}" salad in a matte off-white bowl on a dark walnut table, ${a}. It ` +
    `contains: ${i}. The ingredients sit unevenly as though tossed rather than ` +
    `arranged, dressing clinging in patches, cracked black pepper over the top.`,

  cotes: (n, i, a) =>
    `A portion of "${n}" in a black takeout container on a dark walnut table, ${a}. ` +
    `${i ? `It is: ${i}. ` : ""}The pieces are uneven — some darker and crisper ` +
    `than others — with loose crumbs and a little salt scattered in the container.`,

  breuvages: (n, _i, a) =>
    `A single chilled 355ml soft drink can standing on a dark walnut table, ${a}, ` +
    `beaded with fresh condensation, shallow depth of field. The can is completely ` +
    `bare brushed aluminium — no printing, no lettering, no words, no logo, no ` +
    `label, no graphics whatsoever — with a standard pull tab. A ring of water on ` +
    `the wood beside it.`,
};

export type AutoDish = { file: string; slug: string; category: string; prompt: string };

/**
 * A few items carry no description on the printed card, so the prompt would
 * fall back to the name alone — and a bare name like "Cheesy Bites" gives the
 * model nothing to work with (it produced burnt-looking brown lumps). These
 * spell out what the item physically is.
 */
const OVERRIDES: Record<string, string> = {
  "bouchees-fromage":
    "golden breadcrumb-coated mozzarella bites, deep fried, one broken open with " +
    "white cheese stretching out of it",
  "petite-frite": "golden salted french fries, uneven, some crisper than others",
  "grande-frite": "a large portion of golden salted french fries",
  "frites-patates-douces":
    "sweet potato fries, deep orange, slightly soft and uneven, flecked with salt",
  "rondelles-oignon":
    "battered onion rings of different diameters, one broken showing translucent onion inside",
  "croquettes-poulet": "golden breaded chicken nuggets with a side of fries",
  "parm-original": "melted mozzarella and marinara only, no extra toppings",
  "pain-a-l-ail":
    "a whole round ten-inch flatbread loaf, golden and blistered, brushed all " +
    "over with glossy garlic butter and flecked with chopped parsley, sliced " +
    "into wedges like a pizza and left in place on the pan",
  "parm-creez-votre": "a choice of three toppings — onions, green peppers and mushrooms",
};

/** Ingredient text for an item, falling back to its own name if it has no description. */
function ingredients(item: { slug: string; descEn?: string; descFr?: string; nameEn: string }): string {
  if (OVERRIDES[item.slug]) return OVERRIDES[item.slug];
  return (item.descEn || item.descFr || item.nameEn).replace(/\.$/, "").toLowerCase();
}

export function buildAutoDishes(skipSlugs: Set<string>): AutoDish[] {
  const out: AutoDish[] = [];
  let n = 0;

  for (const cat of MENU) {
    const tmpl = TEMPLATES[cat.slug];
    if (!tmpl) continue;

    for (const item of cat.items) {
      if (skipSlugs.has(item.slug)) continue;
      const angle = ANGLES[n % ANGLES.length];
      n++;
      out.push({
        file: `auto-${item.slug}.jpg`,
        slug: item.slug,
        category: cat.slug,
        prompt: `${tmpl(item.nameEn, ingredients(item), angle)} ${LOOK}`,
      });
    }
  }
  return out;
}
