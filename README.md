# talks

A monorepo of [Slidev](https://sli.dev) decks: one talk = one self-contained project under
`slide/<date>/` with its own `package.json` and lockfile. `scripts/build-pages.mjs` bundles every
deck into a single static site (`dist/`), which GitHub Actions publishes to GitHub Pages.

## Layout

```
index.html               landing page served at the site root (hand-written, restyle it freely)
slide/2026-10-31/        Mooncakes Out of the Oven (a 7-day event design for a mobile game)
  slides.md              the deck itself
  styles/deck.css        theme styles (imported early via setup/main.ts)
  setup/main.ts          Slidev setup entry
  public/images/         all images, referenced as /images/<file>
scripts/build-pages.mjs  build every deck + assemble dist/
.github/workflows/deploy.yml  deploy to GitHub Pages on push to main
```

`index.html` is a plain static page with no JS. The build only replaces the
`<!-- decks -->` marker inside `<ul class="decks">` with one `<li>` per deck
(date, `title:` and `info:` from that deck's frontmatter), then writes the result to
`dist/index.html` and `dist/404.html`. Keep the marker if you rework the markup, and feel free to
change the styling — it is independent of any deck's theme.

## Local development

```bash
cd slide/2026-10-31
pnpm install
pnpm dev        # http://localhost:3030
pnpm build      # single-deck build into slide/2026-10-31/dist/
pnpm export     # export a PDF (requires playwright-chromium)
```

## Preview the combined site locally

`BASE_PATH=/` makes the output use the site root, so any static server works:

```bash
BASE_PATH=/ node scripts/build-pages.mjs   # install deps + build all decks -> dist/
npx serve dist                             # http://localhost:3000
```

Without `BASE_PATH` the prefix is derived from the repository name (`/talks/`; `/` for a
`<user>.github.io` repository or a custom domain).

## Deploying to GitHub Pages

Pushing to `main` triggers `.github/workflows/deploy.yml`: build all decks, upload `dist/`,
deploy.

- Live site: <https://time1043.github.io/talks/>
- First run only: Settings -> Pages -> Source = **GitHub Actions**
  (the workflow's `configure-pages` step also tries to enable it)
- Decks are built with `--router-mode hash`, so deep links look like
  `https://time1043.github.io/talks/2026-10-31/#/9` and never 404 under a subpath

To add a talk, create `slide/<date>/` with a Slidev project (at least `slides.md` and
`package.json`) and push to `main` — the workflow installs, builds it, adds it to the landing page
and publishes it at `/talks/<date>/` with no other change. Commit `pnpm-lock.yaml` as well when you
have one, so CI installs with `--frozen-lockfile`; without a lockfile the build falls back to a
plain install.

The deck name in the URL is the directory name, so `slide/2027-03-08/` becomes
`/talks/2027-03-08/`.
