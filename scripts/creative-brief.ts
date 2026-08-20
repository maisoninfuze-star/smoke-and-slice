/**
 * Art direction for every generated asset.
 *
 * Realism notes — these prompts deliberately avoid the vocabulary that makes
 * image models produce obvious AI gloss ("hyperrealistic", "8k", "ultra
 * detailed", "cinematic masterpiece"). Instead they name a real camera, a real
 * lens, real lighting conditions, and real imperfections (steam, grease sheen,
 * crumbs, uneven char, slight motion blur, shallow handheld focus). That is
 * what separates "photo of food" from "render of food".
 */

const NEGATIVE =
  "cgi, 3d render, plastic, waxy, oversaturated, hdr halo, perfect symmetry, " +
  "studio white background, stock photo watermark, text, logo, extra fingers, " +
  "airbrushed, glossy plastic sheen, unnaturally uniform toppings";

const CAMERA =
  "shot on a Canon EOS R5 with a 50mm f/1.4 at f/2.0, natural window light from " +
  "camera left mixed with warm tungsten from the kitchen pass, deep shadows, " +
  "slight sensor grain, handheld framing that is very slightly off-level";

export type Asset = {
  file: string;
  kind: "image" | "video";
  aspect: string;
  prompt: string;
  /** For video assets: the still that seeds the motion. */
  seedFrom?: string;
  motion?: string;
};

export const NEGATIVE_PROMPT = NEGATIVE;

export const ASSETS: Asset[] = [
  {
    file: "hero-poster.jpg",
    kind: "image",
    aspect: "16:9",
    prompt:
      `A charcoal grill inside a small Montreal takeout kitchen at night. Four thin ` +
      `smashed beef patties sear over open orange flame with lacy browned edges, a ` +
      `slice of cheese just beginning to slump on one of them, and a cluster of ` +
      `spice-rubbed chicken wings charring at the back of the grate. Real smoke curls ` +
      `upward, a few embers rise. A cook's forearm in a black sleeve presses a patty ` +
      `with a metal spatula at the right edge of frame, motion-blurred. Dark ` +
      `charcoal-grey wall behind, out of focus. Grease spits, char is uneven and ` +
      `blackened in patches. No skewers, no kebabs. ${CAMERA}. Photojournalism, not ` +
      `advertising.`,
  },
  {
    file: "hero.mp4",
    kind: "video",
    aspect: "16:9",
    seedFrom: "hero-poster.jpg",
    prompt:
      "Flames flicker and lick upward around the patties, smoke drifts slowly across " +
      "frame, embers rise and fade, the cheese slumps a little further, the cook's " +
      "hand presses down once with the spatula. Subtle handheld camera sway. Nothing " +
      "else moves.",
    motion:
      "slow, natural, documentary handheld — no camera push, no orbit, no speed ramp",
  },
  {
    file: "burger-double.jpg",
    kind: "image",
    aspect: "4:3",
    prompt:
      `A double smashed beef cheeseburger held in two hands over a dark walnut table ` +
      `in a small takeout shop. Two thin craggy patties with lacy browned edges, ` +
      `two slices of melted orange cheese sagging over the sides, caramelised onions, ` +
      `a toasted sesame brioche bun with a thumbprint pressed into the top. Grease ` +
      `shine on the fingertips, a few sesame seeds fallen on the table. ${CAMERA}.`,
  },
  {
    file: "pizza-all-dressed.jpg",
    kind: "image",
    aspect: "4:3",
    prompt:
      `A thin-crust all-dressed pizza on a scratched aluminium pizza pan, shot from ` +
      `directly above on a weathered grey-brown wood table. Beef pepperoni cupped and ` +
      `crisped at the edges, sliced mushrooms, red and green pepper, red onion rings, ` +
      `mozzarella browned unevenly with a few dark blistered spots. One slice pulled ` +
      `slightly away from the rest. Crumbs and a smear of sauce on the pan. ${CAMERA}, ` +
      `overhead.`,
  },
  {
    file: "pizza-chicken.jpg",
    kind: "image",
    aspect: "4:3",
    prompt:
      `A hand lifting one slice from a chicken shawarma pizza, cheese stretching in a ` +
      `long thin strand, the slice sagging under its own weight. Chunks of spiced ` +
      `grilled chicken, red onion, green pepper, garlic sauce drizzled unevenly. The ` +
      `rest of the pizza sits on white deli paper on a dark wood board, slightly out ` +
      `of focus behind. ${CAMERA}.`,
  },
  {
    file: "wings.jpg",
    kind: "image",
    aspect: "4:3",
    prompt:
      `A pile of grilled chicken wings coated in a dry red spice rub on a dark ceramic ` +
      `plate, flecked with chopped parsley, a small cup of ranch behind. Skin is ` +
      `blistered and charred unevenly, some pieces darker than others, a little spice ` +
      `dust fallen on the plate rim. Black linen napkin under one edge. ${CAMERA}.`,
  },
  {
    file: "og-image.jpg",
    kind: "image",
    aspect: "16:9",
    prompt:
      `A takeout counter spread at night: a double cheeseburger, a thin-crust pizza on ` +
      `an aluminium pan, a paper cone of fries and two grilled skewers, arranged ` +
      `casually and slightly overlapping on a dark walnut table, shot from a low ` +
      `three-quarter angle. Warm overhead light, deep charcoal background falling to ` +
      `black, orange rim light from the right. Steam still rising off the fries. ${CAMERA}.`,
  },
];
