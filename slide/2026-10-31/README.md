# Mooncakes Out of the Oven · Imperial Bakery

A 7-day limited-time commercial event design for the mobile game *Call Me Your Majesty*
(《叫我万岁爷》) — an entry for the Dianchu × Xiamen University of Technology "AI Game Workshop".

## Usage

```bash
pnpm install
pnpm dev        # local show at http://localhost:3030
pnpm build      # static build into dist/ (netlify.toml / vercel.json are already wired up)
pnpm export     # export a PDF (needs playwright-chromium)
```

## Layout

```
slides.md          # all 29 slides
styles/deck.css    # dark palace-wall / antique-gold theme (.dy-* / .g-* / .kicker / .bar ...)
setup/main.ts      # Slidev setup entry; imports deck.css early
public/images/     # every image, referenced as /images/<file> from slides.md
```

- Images live in exactly one place: `public/images/`. Drop new files there and reference them as
  `/images/<file>`.
- Styles must be imported from `setup/main.ts` so they load **before** the theme:
  Slidev's auto-loaded stylesheet comes after the theme and would win ties (for example
  `h1 { margin-bottom }`), which shifts the layout away from the reviewed version.

## Content outline

| Act | Slides | Content |
| --- | --- | --- |
| Opening | cover · three-act agenda | workshop intro, three-act overview |
| One | PART 1 game overview | story loop, one round, multipliers, operations, progressive disclosure |
| Two | PART 2 checking against the brief | the brief itself, paid-gamble SKUs, five leaderboards, game fit, completeness, asset compliance |
| Three | PART 3 AI write-up | git workflow, three iterations, lessons, takeaways, playable links |
