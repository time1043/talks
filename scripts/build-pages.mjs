#!/usr/bin/env node
// Build every Slidev deck under slide/<name>/ into a single static site:
//   dist/<name>/           one built deck per directory
//   dist/index.html        the repository's index.html with the deck list injected
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

// Marker in the root index.html that is replaced with the generated deck list.
const DECKS_MARKER = '<!-- decks -->'

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
  const pick = key => new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(frontmatter)?.[1]
    ?.trim()
    // drop optional surrounding quotes so titles survive YAML quoting
    ?.replace(/^(['"])(.*)\1$/, '$2')
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
  if (install) {
    // `--frozen-lockfile` keeps CI reproducible, but a brand-new deck may not
    // have a lockfile yet — fall back to a normal install in that case.
    const hasLockfile = await stat(join(deck.dir, 'pnpm-lock.yaml')).then(() => true, () => false)
    run('pnpm', ['install', ...(hasLockfile ? ['--frozen-lockfile'] : [])], deck.dir)
  }
  run('pnpm', ['exec', 'slidev', 'build', '--base', `${base}${deck.name}/`, '--router-mode', 'hash', '--out', join(outDir, deck.name)], deck.dir)
}

const escapeHtml = str => str
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

const items = decks
  .map(deck => `    <li>
      <a href="${base}${deck.name}/">
        <span class="date">${deck.name}</span>
        <span class="title">${escapeHtml(deck.title)}</span>
        <span class="info">${escapeHtml(deck.info)}</span>
      </a>
    </li>`)
  .join('\n')

const templatePath = join(root, 'index.html')
const template = await readFile(templatePath, 'utf8').catch(() => {
  throw new Error(`Missing landing page template: ${templatePath}`)
})

if (!template.includes(DECKS_MARKER))
  throw new Error(`index.html must contain the marker ${DECKS_MARKER}`)

const html = template.replace(DECKS_MARKER, items.trim())

await writeFile(join(outDir, 'index.html'), html)
await writeFile(join(outDir, '404.html'), html)
// GitHub Pages serves static artifacts as-is, but `.nojekyll` keeps that true
// if the artifact is ever published through the legacy branch-based flow.
await writeFile(join(outDir, '.nojekyll'), '')

console.log(`\nDone. ${decks.length} deck(s) built into ${outDir.replace(root + '/', '')}/`)
for (const deck of decks)
  console.log(`  ${base}${deck.name}/   ${deck.title}`)
