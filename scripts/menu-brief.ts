/**
 * Art direction for the menu photography fal generates.
 *
 * HOW THIS AVOIDS LOOKING AI-GENERATED
 * ------------------------------------
 * 1. One shoot, not eighteen pictures. Every prompt shares the same surface
 *    (dark walnut), the same single warm tungsten key from camera left, and the
 *    same deep falloff — matching the restaurant's own retouched photos, so the
 *    generated plates sit inside the same visual world as the real ones.
 * 2. Real serving vessels: scratched aluminium pizza pans, white deli paper,
 *    plain white diner plates, black plastic takeout containers. Generic
 *    "restaurant plating" is what makes stock food look fake.
 * 3. Deliberate imperfection: uneven melt, a smear of sauce on the rim, crumbs,
 *    a grease spot on the paper, one item sitting crooked.
 * 4. No hands, ever. Hands are the fastest way to spot a generated photo, and
 *    the client asked for none on the burgers.
 * 5. Angles are varied on purpose — overhead, low three-quarter, eye level,
 *    tight crop. Eighteen shots from the same angle reads as a template.
 * 6. The prompt names a camera and a lens, never "hyperrealistic", "8k" or
 *    "ultra detailed" — that vocabulary is what pushes these models toward the
 *    glossy CGI look.
 */

export const NEGATIVE =
  "hands, fingers, arms, people, cgi, 3d render, plastic, waxy, oversaturated, " +
  "hdr halo, perfect symmetry, studio white background, stock photo watermark, " +
  "text, logo, airbrushed, glossy plastic sheen, unnaturally uniform toppings, " +
  "floating garnish, steam plume, sparks, confetti, lettering, letters, words, " +
  "brand name, printed label, corn, peas, chickpeas, beans, mozzarella pearls, " +
  "foam, coral texture, identical repeated shapes";

/** The one lighting and surface setup the whole set shares. */
const LOOK =
  "Shot on a Canon EOS R5, 50mm f/1.4 at f/2.0. Single warm tungsten key from " +
  "camera left, deep shadow falloff into near-black on the right, dark walnut " +
  "table surface, slight sensor grain, framing very slightly off-level. " +
  "Natural and photographic, like a phone-free evening service shot by someone " +
  "who knows how to light — not advertising, not a render.";

export type Dish = {
  file: string;
  /** menu-data.ts slug this photo will be attached to */
  slug: string;
  aspect: string;
  prompt: string;
};

export const DISHES: Dish[] = [
  // ── burgers (no hands) ────────────────────────────────────────────
  {
    file: "dish-burger-double.jpg",
    slug: "beef-mode",
    aspect: "4:3",
    prompt:
      "A double smashed beef cheeseburger sitting on white deli paper on a dark " +
      "walnut table, photographed at eye level from the side so the two thin " +
      "patties and their lacy browned edges are clearly visible. Two slices of " +
      "melted orange cheddar sag over the sides, shredded lettuce and a slice of " +
      "tomato peek out, the toasted sesame bun is slightly squashed on one side. " +
      "A grease spot has soaked through the paper. Nobody is holding it. " + LOOK,
  },
  {
    file: "dish-burger-stack.jpg",
    slug: "king-kong",
    aspect: "4:3",
    prompt:
      "A tall triple-patty beef burger with bacon, on white deli paper on a dark " +
      "walnut table, shot from a low three-quarter angle so the stack looms. " +
      "Three thin patties with charred edges, cheddar melted between each, strips " +
      "of bacon curling out, red onion and lettuce. The bun leans slightly. A " +
      "steel skewer holds it together. No hands in frame. " + LOOK,
  },

  // ── poulet parmesan ───────────────────────────────────────────────
  {
    file: "dish-chicken-parm.jpg",
    slug: "parm-original",
    aspect: "4:3",
    prompt:
      "A chicken parmesan on a plain white diner plate: a breaded chicken cutlet " +
      "under bright red marinara and browned melted mozzarella, with a pile of " +
      "golden fries beside it. Overhead three-quarter angle. The cheese is " +
      "unevenly browned with a couple of dark blistered spots, a smear of sauce " +
      "sits on the plate rim, a few fries have fallen onto the walnut table. " + LOOK,
  },

  // ── club sandwich ─────────────────────────────────────────────────
  {
    file: "dish-club.jpg",
    slug: "club-classique",
    aspect: "4:3",
    prompt:
      "A club sandwich cut into two triangles and stacked leaning against each " +
      "other on a white plate, grilled marinated chicken, lettuce and tomato " +
      "visible in the layers, toothpicks through the top. A pile of fries fills " +
      "the rest of the plate. Eye-level angle, dark walnut table. One triangle " +
      "sits crooked. " + LOOK,
  },

  // ── poutine ───────────────────────────────────────────────────────
  {
    file: "dish-poutine.jpg",
    slug: "poutine-classique",
    aspect: "4:3",
    prompt:
      "A classic Quebec poutine in a black plastic takeout container on a dark " +
      "walnut table, shot from a high three-quarter angle. Golden fries buried " +
      "under glossy brown gravy. Scattered through it are chunks of fresh cheese " +
      "torn by hand from a solid block: flat jagged shards and thick ragged " +
      "pieces with rough broken edges and stringy corners, every one a different " +
      "size and silhouette, half sunk into the gravy and beginning to melt at the " +
      "edges, matte and slightly rubbery. Gravy has run down one side of the " +
      "container. A plastic fork rests beside it. " + LOOK,
  },
  {
    file: "dish-poutine-beef.jpg",
    slug: "poutine-boeuf",
    aspect: "4:3",
    prompt:
      "A beef poutine in a black takeout container, shot from directly overhead " +
      "on a dark walnut table. It contains exactly four things and nothing else: " +
      "golden fries, glossy brown gravy, irregular torn white cheddar curds, and " +
      "coarsely browned seasoned minced beef crumbled over the top. Absolutely no " +
      "corn, peas, chickpeas, beans or round yellow objects of any kind. The beef " +
      "is uneven and craggy, gravy pooled at one edge. " + LOOK,
  },

  // ── wraps ─────────────────────────────────────────────────────────
  {
    file: "dish-wrap.jpg",
    slug: "wrap-poulet-classique",
    aspect: "4:3",
    prompt:
      "A chicken wrap cut in half on the diagonal, both halves standing cut-face " +
      "up on white deli paper so the filling shows: grilled chicken, shredded " +
      "lettuce, red onion, tomato and a stripe of mayonnaise inside a soft flour " +
      "tortilla with light grill marks. Dark walnut table, eye-level, tight crop. " +
      "A little sauce has squeezed out onto the paper. " + LOOK,
  },
  {
    file: "dish-wrap-beef.jpg",
    slug: "wrap-boeuf-epice",
    aspect: "4:3",
    prompt:
      "A spicy beef wrap cut in half, halves leaning against each other on white " +
      "deli paper. The filling is only browned seasoned minced beef, shredded " +
      "lettuce, sliced red onion, sliced green jalapeños and sliced black olives " +
      "in a lightly charred flour tortilla — no beans, no chickpeas, no white " +
      "round objects. Dark walnut table, low three-quarter angle. Chilli flecks " +
      "scattered on the paper. " + LOOK,
  },

  // ── salades ───────────────────────────────────────────────────────
  {
    file: "dish-salad-cesar.jpg",
    slug: "salade-cesar",
    aspect: "4:3",
    prompt:
      "A Caesar salad in a matte off-white bowl on a dark walnut table, shot from " +
      "a high angle: roughly torn romaine lettuce leaves, pale creamy dressing " +
      "clinging unevenly to the leaves, curls of shaved parmesan, and croutons " +
      "that are clearly cubes of toasted bread with visible open crumb texture " +
      "and sharp cut corners — not battered, not breaded, not nuggets. A dusting " +
      "of cracked black pepper. Some leaves stand up, others lie flat. " + LOOK,
  },
  {
    file: "dish-salad-greek.jpg",
    slug: "salade-grecque",
    aspect: "4:3",
    prompt:
      "A Greek salad in a shallow matte bowl on a dark walnut table, overhead " +
      "angle: wedges of tomato, cucumber chunks, green pepper, red onion rings, " +
      "black olives and a thick slab of feta on top, olive oil pooling at the " +
      "bottom, cracked pepper over it. Ingredients sit unevenly, not arranged. " + LOOK,
  },

  // ── côtés ─────────────────────────────────────────────────────────
  {
    file: "dish-fries.jpg",
    slug: "grande-frite",
    aspect: "4:3",
    prompt:
      "A large portion of golden fries in a white paper cone standing in a black " +
      "takeout container on a dark walnut table, eye-level tight crop. The fries " +
      "are uneven — some darker and crispier, some pale — with visible salt " +
      "crystals. A few have spilled onto the table. " + LOOK,
  },
  {
    file: "dish-garlic-bread.jpg",
    slug: "pain-ail-gratine",
    aspect: "4:3",
    prompt:
      "A ten-inch cheesy garlic bread on a scratched round aluminium pizza pan, " +
      "cut into strips, shot from directly overhead on a dark walnut table. " +
      "Browned melted mozzarella over garlic paste, unevenly blistered with a few " +
      "dark spots, flecks of parsley. One strip pulled slightly away, cheese " +
      "stretching between it and the rest. " + LOOK,
  },
  {
    file: "dish-onion-rings.jpg",
    slug: "rondelles-oignon",
    aspect: "4:3",
    prompt:
      "A pile of battered onion rings in a black takeout container on a dark " +
      "walnut table, high three-quarter angle. Each ring is a different diameter " +
      "and sits at its own angle, the breadcrumb coating rough and patchy with " +
      "clear golden-to-deep-brown variation between rings, and one broken ring " +
      "showing the soft translucent onion inside. The coating is coarse " +
      "breadcrumb, not smooth foam and not a uniform lattice. Loose crumbs in the " +
      "container. " + LOOK,
  },
  {
    file: "dish-nuggets.jpg",
    slug: "croquettes-poulet",
    aspect: "4:3",
    prompt:
      "Breaded chicken nuggets with a portion of fries in a black takeout " +
      "container on a dark walnut table, overhead angle, with a small tub of " +
      "dipping sauce tucked in one corner. The breading is uneven and golden, one " +
      "nugget broken open. " + LOOK,
  },

  // ── pizzas ────────────────────────────────────────────────────────
  {
    file: "dish-pizza-pepperoni.jpg",
    slug: "pepperoni",
    aspect: "4:3",
    prompt:
      "A thin-crust pepperoni pizza on a scratched round aluminium pizza pan, " +
      "shot from directly overhead on a dark walnut table. Beef pepperoni slices " +
      "cupped and crisped at the edges with little pools of orange oil in them, " +
      "mozzarella browned unevenly with dark blistered spots, the crust puffed " +
      "irregularly. One slice cut and shifted slightly out of place. " + LOOK,
  },
  {
    file: "dish-pizza-veg.jpg",
    slug: "vegetarienne",
    aspect: "4:3",
    prompt:
      "A thin-crust vegetarian pizza on a scratched aluminium pizza pan, overhead " +
      "on a dark walnut table: green pepper strips, red onion rings, black " +
      "olives, sliced mushrooms and tomato over browned mozzarella. Toppings are " +
      "scattered unevenly, heavier on one side. Crust blistered and charred in " +
      "spots. " + LOOK,
  },

  // ── sous-marin ────────────────────────────────────────────────────
  {
    file: "dish-sub-chicken.jpg",
    slug: "cheesy-chicken",
    aspect: "4:3",
    prompt:
      "A chicken submarine sandwich on white deli paper on a dark walnut table, " +
      "eye-level from the side, cut in half with one half turned to show the " +
      "filling: grilled chicken, melted cheddar, shredded lettuce, red onion and " +
      "pickles in a soft sub roll. Sauce has run onto the paper. No hands. " + LOOK,
  },

  // ── breuvages ─────────────────────────────────────────────────────
  {
    file: "dish-drinks.jpg",
    slug: "coke",
    aspect: "4:3",
    prompt:
      "Three standard 355ml soft drink cans standing on a dark walnut table, " +
      "beaded with fresh condensation, shot at eye level with shallow depth of " +
      "field so the rearmost falls out of focus. The cans are completely bare " +
      "brushed aluminium — no printing, no lettering, no words, no logo, no " +
      "label, no graphics of any kind, just plain unprinted metal with the " +
      "standard pull tab. A ring of water sits on the wood beside them. " + LOOK,
  },
];
