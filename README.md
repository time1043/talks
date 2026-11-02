# talks

A monorepo of [Slidev](https://sli.dev) decks: one talk = one self-contained project under
`slide/<date>/` with its own `package.json` and lockfile. `scripts/build-pages.mjs` bundles every
deck into a single static site (`dist/`), which GitHub Actions publishes to GitHub Pages.

## Layout

```
slide/2026-10-31/        Mooncakes Out of the Oven (a 7-day event design for a mobile game)
  slides.md              the deck itself
  styles/deck.css        theme styles (imported early via setup/main.ts)
  setup/main.ts          Slidev setup entry
  public/images/         all images, referenced as /images/<file>
scripts/build-pages.mjs  build every deck + generate the dist/index.html landing page
.github/workflows/deploy.yml  deploy to GitHub Pages on push to main
```

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

To add a talk, create `slide/<date>/` with a Slidev project (at least `slides.md`,
`package.json`, `pnpm-lock.yaml`); after a push it appears on the landing page and at
`/talks/<date>/`.
