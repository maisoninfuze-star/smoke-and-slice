# Mr Smoke Et Slice — brand kit

Everything here was read off the restaurant's own storefront signage and Google
listing photos (`reference/`). Nothing was invented.

## The lockup

```
        MR              ← gold, wide-tracked, sits above
  SMOKE ET SLICE        ← cream / flame-red "ET" / cream
  L'AMOUR À LA PREMIÈRE SLICE   ← small caps, wide tracking
```

The sign renders "SMOKE" and "SLICE" in a metallic gold-to-cream gradient with
"ET" picked out in red. On screen we hold the same hierarchy: gold `MR`, cream
wordmark, red conjunction. Icons on the awning: skewer, burger, pizza slice,
flame, grill pan.

## Palette

| Token | Hex | Where it came from |
|---|---|---|
| `charcoal` | `#22252B` | The painted brick and awning ground |
| `charcoal-deep` | `#14161A` | Night falloff behind the sign |
| `slate` | `#3A4048` | The blue-grey storefront frame and door |
| `ember` | `#F2610C` | Flame orange in the signage artwork |
| `flame` | `#E01B24` | The red "ET" and the OUVERT neon |
| `gold` | `#F5B33C` | "MR" and the flame highlights |
| `cream` | `#F7EFE2` | The wordmark type |
| `halal` | `#25D366` | The green HALAL neon in the window |
| `smoke` | `#9AA1AC` | Muted captions and dividers |

Signature gradient (`.ember-text` / `.ember-bg`):
`linear-gradient(100deg, #F5B33C, #F2610C 48%, #E01B24)` — the exact gold→orange→red
run across the sign.

## Type

- **Display** — Anton, uppercase, `-0.02em`. Stands in for the heavy condensed
  slab on the awning.
- **Accent** — Bebas Neue, `+0.04em`. Prices, badges, nav. Mirrors the
  `HAMBURGER • PIZZA • FIRE GRILLED` banner strip.
- **Body** — Inter.

## Voice

French first, English second — that's the order on the awning. Warm,
neighbourhood-proud, unpretentious, a little smoky swagger. Avoid corporate
fast-food speak, stacked exclamation marks, and "artisanal" clichés.

## Photography

Close, hand-held, hot off the grill. Real hands in frame. Charred uneven edges,
visible cheese pull, scratched aluminium pizza pans, dark walnut tables. One warm
key light from the side, deep charcoal falloff, ember rim light.

**Never**: sterile white-background studio shots, HDR halos, perfectly
symmetrical plating, glossy CGI sheen.

The prompts in `../scripts/creative-brief.ts` encode this by naming a real camera
and real imperfections instead of using words like "hyperrealistic" or "8k",
which is what pushes image models toward the obvious AI look.

## Facts

- Halal · Hamburger · Pizza · Grillée au feu / Fire Grilled
- 5518 Sherbrooke St W, Montréal, QC H4A 1W2 (NDG, facing the park)
- (514) 826-5780 · (514) 820-0069
- 4.6★ from 136 Google reviews · $10–20 per person
- Outdoor seating, dogs welcome outside
