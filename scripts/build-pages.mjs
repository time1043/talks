#!/usr/bin/env node
// Build every Slidev deck under slide/<name>/ into a single static site:
//   dist/<name>/           one built deck per directory
//   dist/index.html        landing page linking to all decks
//   dist/404.html          same landing page, so unknown paths still show the list
//
// Usage:
//   node scripts/build-pages.mjs               # install deps, then build
//   node scripts/build-pages.mjs --no-install  # deps already installed
//   BASE_PATH=/talks/ node scripts/build-pages.mjs
//
// Notes:
//   - `base` defaults to the repository name (`/talks/` for a GitHub Pages
//     project site at https://<user>.github.io/<repo>/), and to `/` for
//     `<user>.github.io` repositories or custom domains.
//   - Decks are built with `--router-mode hash` so deep links such as
//     /talks/2026-10-31/#/9 keep working on hosts without URL rewriting.

import { execFileSync } from 'node:child_process'
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const args = new Set(process.argv.slice(2))
const install = !args.has('--no-install')

function defaultBase() {
  // The repo name is available in CI; locally we assume /talks/.
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'talks'
  return repo.endsWith('.github.io') ? '/' : `/${repo}/`
}

const base = (process.env.BASE_PATH ?? defaultBase()).replace(/\/+$/, '') + '/'
const outDir = join(root, 'dist')

function run(cmd, argv, cwd) {
  console.log(`\n$ ${cmd} ${argv.join(' ')}   (${cwd.replace(root + '/', '')})`)
  execFileSync(cmd, argv, {
    cwd,
    stdio: 'inherit',
    // The deck only needs the browser for `slidev export`, never for a build.
    env: { ...process.env, PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1' },
  })
}

async function readMeta(dir, name) {
  const entry = join(dir, 'slides.md')
  try {
    await stat(entry)
  }
  catch {
    return null
  }
  const md = await readFile(entry, 'utf8')
  const frontmatter = /^---\n([\s\S]*?)\n---/.exec(md)?.[1] ?? ''
  const pick = key => new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(frontmatter)?.[1]?.trim()
  return {
    name,
    dir,
    title: pick('title') ?? name,
    info: pick('info') ?? '',
  }
}

const decks = []
for (const name of (await readdir(join(root, 'slide'))).sort()) {
  const meta = await readMeta(join(root, 'slide', name), name)
  if (meta)
    decks.push(meta)
}

if (!decks.length) {
  console.error('No deck found. Expected slide/<name>/slides.md')
  process.exit(1)
}

await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })

for (const deck of decks) {
  if (install)
    run('pnpm', ['install', '--frozen-lockfile'], deck.dir)
  run('pnpm', ['exec', 'slidev', 'build', '--base', `${base}${deck.name}/`, '--router-mode', 'hash', '--out', join(outDir, deck.name)], deck.dir)
}

const cards = decks
  .map(deck => `    <a class="card" href="${base}${deck.name}/">
      <span class="date">${deck.name}</span>
      <span class="title">${deck.title}</span>
      <span class="info">${deck.info}</span>
    </a>`)
  .join('\n')

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Talks</title>
<style>
  :root { color-scheme: dark; }
  body {
    margin: 0; min-height: 100vh; box-sizing: border-box; padding: 10vh 8vw;
    background: radial-gradient(120% 90% at 50% 0%, #2a1512 0%, #150b0b 45%, #0b0607 100%);
    color: #f3e9d2; font-family: 'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', system-ui, sans-serif;
  }
  h1 { font-family: 'STZhongsong', 'Noto Serif SC', serif; color: #f0b429; font-size: 2em; margin: 0 0 6px; }
  p.sub { color: #c3b090; margin: 0 0 40px; font-size: .95em; letter-spacing: .04em; }
  .list { display: flex; flex-direction: column; gap: 12px; max-width: 780px; }
  .card {
    display: grid; grid-template-columns: 8.5em 1fr; gap: 4px 18px; align-items: baseline;
    padding: 18px 22px; text-decoration: none; color: inherit;
    background: rgba(255, 205, 120, .055); border: 1px solid rgba(240, 180, 65, .26); border-radius: 12px;
    transition: background .18s ease, border-color .18s ease, transform .18s ease;
  }
  .card:hover { background: rgba(255, 205, 120, .1); border-color: rgba(240, 180, 65, .55); transform: translateY(-2px); }
  .date { font-family: Consolas, 'JetBrains Mono', monospace; color: #c3b090; font-size: .82em; }
  .title { font-family: 'STZhongsong', 'Noto Serif SC', serif; color: #ffd166; font-size: 1.22em; }
  .info { grid-column: 2; color: #c3b090; font-size: .86em; }
</style>
</head>
<body>
  <h1>Talks</h1>
  <p class="sub">Slidev decks &middot; ${decks.length}</p>
  <div class="list">
${cards}
  </div>
</body>
</html>
`

await writeFile(join(outDir, 'index.html'), html)
await writeFile(join(outDir, '404.html'), html)
// GitHub Pages serves static artifacts as-is, but `.nojekyll` keeps that true
// if the artifact is ever published through the legacy branch-based flow.
await writeFile(join(outDir, '.nojekyll'), '')

console.log(`\nDone. ${decks.length} deck(s) built into ${outDir.replace(root + '/', '')}/`)
for (const deck of decks)
  console.log(`  ${base}${deck.name}/   ${deck.title}`)
