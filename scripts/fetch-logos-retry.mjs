/**
 * Second-pass retry for manufacturers that failed in fetch-logos.mjs.
 * Uses the Wikimedia Commons search API to discover actual SVG filenames,
 * then falls back to a fresh set of manually-researched alternatives.
 * Usage: node scripts/fetch-logos-retry.mjs
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const LOGOS_DIR = join(ROOT, 'public', 'logos')
mkdirSync(LOGOS_DIR, { recursive: true })

const wiki = (filename) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`

// Manually-researched second and third alternatives for every failed manufacturer.
// These are distinct from the candidates already tried in the first script.
const RETRIES = [
  // ── UK ──────────────────────────────────────────────────────────────────
  ['Land Rover',    'land-rover',    [
    'Jaguar_Land_Rover_logo.svg',
    'Land_Rover_logo_2011.svg',
    'Land-Rover-Logo.svg',
    'Land_rover.svg',
  ]],
  ['Jaguar',        'jaguar',        [
    'Jaguar_(car_brand)_logo.svg',
    'Jaguar_Cars.svg',
    'Jaguar_logo_2012.svg',
    'Jaguar_cars.svg',
  ]],
  ['Bentley',       'bentley',       [
    'Bentley_Motors.svg',
    'Bentley-logo.svg',
    'Bentley_logo_2.svg',
    'BentleyMotors.svg',
  ]],
  ['Aston Martin',  'aston-martin',  [
    'Aston_Martin_logo_2003.svg',
    'Aston_Martin_Lagonda.svg',
    'Aston-Martin-Logo.svg',
    'Aston_Martin_wings_logo.svg',
  ]],
  ['Lotus',         'lotus',         [
    'Lotus_logo_2019.svg',
    'Lotus_F1_Team_Logo.svg',
    'Geely_Lotus_Logo.svg',
    'Lotus_Cars.svg',
  ]],
  ['Morgan',        'morgan',        [
    'Morgan_Cars_logo.svg',
    'Morgan_3_Wheeler_logo.svg',
    'Morgan_Motor.svg',
    'MorganMotorCompanyLogo.svg',
  ]],
  ['MG',            'mg',            [
    'MG_brand_logo_since_2021.svg',
    'SAIC_MG_Motor_logo.svg',
    'MG_Cars_logo.svg',
    'MG6_logo.svg',
  ]],
  ['Noble',         'noble',         [
    'Noble_cars_logo.svg',
    'Noble_M600.svg',
    'Noble_Automotive.svg',
  ]],
  ['Caterham',      'caterham',      [
    'Caterham_Seven_logo.svg',
    'Caterham_F1_logo.svg',
    'CaterhamCars.svg',
  ]],

  // ── German ──────────────────────────────────────────────────────────────
  ['Porsche',       'porsche',       [
    'Porsche_crest.svg',
    'Porsche_AG_logo.svg',
    'Logo_der_Porsche_AG.svg',
    'Porsche_wordmark.svg',
    'Porsche-Logo.svg',
  ]],

  // ── French ──────────────────────────────────────────────────────────────
  ['Citroën',       'citroen',       [
    'Citroën_2016_logo.svg',
    'Citroen_2016_logo.svg',
    'Logo_Citroen.svg',
    'Citroën_chevrons.svg',
    'Citroën_logo_2009.svg',
  ]],
  ['DS',            'ds',            [
    'DS_Automobiles.svg',
    'DS_Automobiles_2016_logo.svg',
    'DS_brand_logo.svg',
    'DS_cars_logo.svg',
  ]],

  // ── Italian ─────────────────────────────────────────────────────────────
  ['Alfa Romeo',    'alfa-romeo',    [
    'Alfa_Romeo_2015.svg',
    'Alfa_Romeo_Milan.svg',
    'Alfa_Romeo_Logo.svg',
    'Alfa_romeo_logo.svg',
    'Alfa-Romeo-Logo.svg',
  ]],
  ['Ferrari',       'ferrari',       [
    'Ferrari_wordmark.svg',
    'Ferrari_S.p.A._Logo.svg',
    'FerrariLogo.svg',
    'Ferrari.svg',
  ]],
  ['Lancia',        'lancia',        [
    'Lancia_2023.svg',
    'Lancia_new_logo.svg',
    'Lancia-Logo.svg',
    'Lancia_flag_logo.svg',
  ]],
  ['Maserati',      'maserati',      [
    'Maserati_Trident.svg',
    'Maserati_trident_logo.svg',
    'Maserati-Logo.svg',
    'Maserati_logo_2020.svg',
  ]],
  ['Pagani',        'pagani',        [
    'Pagani_Automobili.svg',
    'Pagani_Huayra_logo.svg',
    'Pagani-Logo.svg',
  ]],

  // ── Swedish ─────────────────────────────────────────────────────────────
  ['Saab',          'saab',          [
    'Saab_AB_logo.svg',
    'Saab_Automobile.svg',
    'Saab-Logo.svg',
    'SAAB_automobiles_logo.svg',
  ]],

  // ── Japanese ────────────────────────────────────────────────────────────
  ['Isuzu',         'isuzu',         [
    'Isuzu_logo_2019.svg',
    'Isuzu-Logo.svg',
    'Isuzu_motors.svg',
    'Isuzu_new_logo.svg',
  ]],

  // ── American ────────────────────────────────────────────────────────────
  ['Buick',         'buick',         [
    'Buick_2022.svg',
    'Buick-Logo.svg',
    'Buick_logo_2022_new.svg',
    'Buick_tri-shield_logo.svg',
  ]],
  ['Cadillac',      'cadillac',      [
    'Cadillac_2021.svg',
    'Cadillac-Logo.svg',
    'Cadillac_2021_logo.svg',
    'Cadillac_logo_2021.svg',
  ]],
  ['Chevrolet',     'chevrolet',     [
    'Chevrolet_2013.svg',
    'Chevrolet-Logo.svg',
    'Chevrolet_bowtie_2013.svg',
    'Chevrolet_bowtie.svg',
  ]],
  ['Chrysler',      'chrysler',      [
    'Chrysler_2010.svg',
    'Chrysler-Logo.svg',
    'Chrysler_logo_2009.svg',
    'Chrysler_pentastar.svg',
  ]],
  ['RAM',           'ram',           [
    'Ram_Trucks_2019_logo.svg',
    'Ram-Logo.svg',
    'RAM_Trucks_logo.svg',
    'Ram_trucks_logo.svg',
  ]],

  // ── Korean ──────────────────────────────────────────────────────────────
  ['Kia',           'kia',           [
    'Kia_logo_2021.svg',
    'KIA_logo.svg',
    'Kia_2021_logo.svg',
    'Kia-logo.svg',
    'Kia_new_logo.svg',
  ]],

  // ── Niche / less-common ──────────────────────────────────────────────────
  ['Donkervoort',   'donkervoort',   [
    'Donkervoort_cars.svg',
    'Donkervoort_D8.svg',
  ]],
  ['Skoda',         'skoda',         [
    'Skoda_Auto_2011.svg',
    'Skoda_wordmark.svg',
    'Skoda_logo_2016.svg',
    'Skoda-Logo.svg',
    'Skoda_logo_new.svg',
  ]],
  ['Dacia',         'dacia',         [
    'Dacia_2021.svg',
    'Dacia-Logo.svg',
    'Dacia_new_logo.svg',
    'Dacia_logo_2023.svg',
  ]],
  ['Cupra',         'cupra',         [
    'Cupra_2018.svg',
    'CUPRA_brand_logo.svg',
    'Cupra_automobiles_logo.svg',
    'Cupra-logo.svg',
  ]],
  ['SEAT',          'seat',          [
    'SEAT_2012.svg',
    'Seat_logo_2012.svg',
    'SEAT_logo_2012.svg',
    'SEAT-Logo.svg',
    'SEAT_wordmark.svg',
  ]],
  ['BYD',           'byd',           [
    'BYD_company_logo.svg',
    'BYD-Logo.svg',
    'BYD_Auto.svg',
    'BYD_logo_2022.svg',
  ]],
]

// ─── Helpers (same as fetch-logos.mjs) ────────────────────────────────────────

async function fetchSvg(url) {
  let res
  try {
    res = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': 'knownissues-logo-fetcher/1.0 (contact@knownissues.co.uk)' },
      signal: AbortSignal.timeout(15_000),
    })
  } catch (err) {
    return { ok: false, reason: err.message }
  }
  if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` }
  const ct = res.headers.get('content-type') ?? ''
  const text = await res.text()
  const looksLikeSvg =
    ct.includes('svg') ||
    text.trimStart().startsWith('<svg') ||
    text.trimStart().startsWith('<?xml') ||
    text.includes('<svg ')
  if (!looksLikeSvg) return { ok: false, reason: `Not SVG (content-type: ${ct})` }
  if (text.length < 100) return { ok: false, reason: `SVG too small (${text.length} bytes)` }
  return { ok: true, svg: text, finalUrl: res.url }
}

function isSvgUsable(svg) {
  return /<(path|circle|rect|polygon|polyline|line|ellipse|g|text|use)\b/i.test(svg)
}

// ─── Wikimedia API search ──────────────────────────────────────────────────────

async function searchWikimediaForSvg(query) {
  const url = new URL('https://commons.wikimedia.org/w/api.php')
  url.searchParams.set('action', 'query')
  url.searchParams.set('list', 'search')
  url.searchParams.set('srsearch', `filetype:svg ${query} logo`)
  url.searchParams.set('srnamespace', '6')
  url.searchParams.set('srlimit', '5')
  url.searchParams.set('format', 'json')
  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'knownissues-logo-fetcher/1.0' },
      signal: AbortSignal.timeout(10_000),
    })
    const json = await res.json()
    return (json?.query?.search ?? []).map((r) => r.title.replace(/^File:/, ''))
  } catch {
    return []
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const newSuccesses = []
const stillFailed  = []

console.log(`\nRetrying ${RETRIES.length} failed manufacturers...\n`)
console.log('='.repeat(72))

for (const [name, slug, filenames] of RETRIES) {
  // Skip if a logo was already saved (e.g. by running this script twice)
  if (existsSync(join(LOGOS_DIR, `${slug}.svg`))) {
    console.log(`  SKIP     ${name.padEnd(16)} — already have public/logos/${slug}.svg`)
    newSuccesses.push({ name, slug, filename: `${slug}.svg`, source: 'pre-existing' })
    continue
  }

  let fetched = false

  // 1. Try the manual alternates first
  for (let i = 0; i < filenames.length; i++) {
    const filename = filenames[i]
    const url = wiki(filename)
    process.stdout.write(`  ALT ${i + 1}    ${name.padEnd(16)} ${filename.slice(0, 50)} … `)
    const result = await fetchSvg(url)
    if (!result.ok) { console.log(`✗  ${result.reason}`); continue }
    if (!isSvgUsable(result.svg)) { console.log(`✗  No vector content`); continue }
    writeFileSync(join(LOGOS_DIR, `${slug}.svg`), result.svg, 'utf8')
    console.log(`✓  saved → public/logos/${slug}.svg`)
    newSuccesses.push({ name, slug, filename: `${slug}.svg`, source: filename })
    fetched = true
    break
  }

  if (fetched) continue

  // 2. Fall back to Wikimedia API search
  process.stdout.write(`  SEARCH   ${name.padEnd(16)} querying Wikimedia Commons API … `)
  const apiResults = await searchWikimediaForSvg(name)
  if (apiResults.length > 0) {
    console.log(`found ${apiResults.length} candidates: ${apiResults.join(', ')}`)
    for (const filename of apiResults) {
      process.stdout.write(`  API TRY  ${name.padEnd(16)} ${filename.slice(0, 50)} … `)
      const result = await fetchSvg(wiki(filename))
      if (!result.ok) { console.log(`✗  ${result.reason}`); continue }
      if (!isSvgUsable(result.svg)) { console.log(`✗  No vector content`); continue }
      writeFileSync(join(LOGOS_DIR, `${slug}.svg`), result.svg, 'utf8')
      console.log(`✓  saved → public/logos/${slug}.svg`)
      newSuccesses.push({ name, slug, filename: `${slug}.svg`, source: filename })
      fetched = true
      break
    }
  } else {
    console.log('no results')
  }

  if (!fetched) {
    console.log(`  FAILED   ${name.padEnd(16)} — no SVG found on Wikimedia Commons`)
    stillFailed.push({ name, slug })
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log('\n' + '='.repeat(72))
console.log(`\n✓ ${newSuccesses.filter(s => s.source !== 'pre-existing').length} additional logos downloaded`)
console.log(`✗ ${stillFailed.length} still unavailable\n`)

if (stillFailed.length > 0) {
  console.log('No SVG logo found on Wikimedia Commons for:')
  for (const f of stillFailed) console.log(`  • ${f.name} (${f.slug})`)
}

// ─── Regenerate SQL with all logos now in public/logos/ ──────────────────────

// Read the existing seed SQL and append new manufacturers
const existingSql = existsSync(join(__dirname, 'manufacturers-seed.sql'))
  ? readFileSync(join(__dirname, 'manufacturers-seed.sql'), 'utf8')
  : ''

// Build combined list from all downloaded logos
// Display order matches the MANUFACTURERS array ordering from the first script.
const REGION_ORDER = [
  'land-rover','jaguar','bentley','rolls-royce','aston-martin','mclaren',
  'lotus','morgan','mini','mg','tvr','noble','caterham',
  'bmw','mercedes-benz','audi','volkswagen','porsche','opel',
  'bugatti','citroen','ds','peugeot','renault',
  'alfa-romeo','ferrari','fiat','lamborghini','lancia','maserati','pagani',
  'koenigsegg','saab','volvo',
  'acura','daihatsu','honda','infiniti','isuzu','lexus','mazda',
  'mitsubishi','nissan','subaru','suzuki','toyota',
  'buick','cadillac','chevrolet','chrysler','dodge','ford','gmc',
  'jeep','lincoln','lucid','ram','rivian','tesla',
  'genesis','hyundai','kia',
  'donkervoort',
  'skoda',
  'dacia',
  'cupra','seat',
  'byd','geely','nio','xpeng',
]

const ALL_NAMES = {
  'land-rover': 'Land Rover', 'jaguar': 'Jaguar', 'bentley': 'Bentley',
  'rolls-royce': 'Rolls-Royce', 'aston-martin': 'Aston Martin', 'mclaren': 'McLaren',
  'lotus': 'Lotus', 'morgan': 'Morgan', 'mini': 'Mini', 'mg': 'MG', 'tvr': 'TVR',
  'noble': 'Noble', 'caterham': 'Caterham', 'bmw': 'BMW',
  'mercedes-benz': 'Mercedes-Benz', 'audi': 'Audi', 'volkswagen': 'Volkswagen',
  'porsche': 'Porsche', 'opel': 'Opel', 'bugatti': 'Bugatti', 'citroen': 'Citroën',
  'ds': 'DS', 'peugeot': 'Peugeot', 'renault': 'Renault',
  'alfa-romeo': 'Alfa Romeo', 'ferrari': 'Ferrari', 'fiat': 'Fiat',
  'lamborghini': 'Lamborghini', 'lancia': 'Lancia', 'maserati': 'Maserati',
  'pagani': 'Pagani', 'koenigsegg': 'Koenigsegg', 'saab': 'Saab', 'volvo': 'Volvo',
  'acura': 'Acura', 'daihatsu': 'Daihatsu', 'honda': 'Honda', 'infiniti': 'Infiniti',
  'isuzu': 'Isuzu', 'lexus': 'Lexus', 'mazda': 'Mazda', 'mitsubishi': 'Mitsubishi',
  'nissan': 'Nissan', 'subaru': 'Subaru', 'suzuki': 'Suzuki', 'toyota': 'Toyota',
  'buick': 'Buick', 'cadillac': 'Cadillac', 'chevrolet': 'Chevrolet',
  'chrysler': 'Chrysler', 'dodge': 'Dodge', 'ford': 'Ford', 'gmc': 'GMC',
  'jeep': 'Jeep', 'lincoln': 'Lincoln', 'lucid': 'Lucid', 'ram': 'RAM',
  'rivian': 'Rivian', 'tesla': 'Tesla', 'genesis': 'Genesis', 'hyundai': 'Hyundai',
  'kia': 'Kia', 'donkervoort': 'Donkervoort', 'skoda': 'Skoda', 'dacia': 'Dacia',
  'cupra': 'Cupra', 'seat': 'SEAT', 'byd': 'BYD', 'geely': 'Geely',
  'nio': 'NIO', 'xpeng': 'Xpeng',
}

const { readdirSync } = await import('node:fs')
const savedSlugs = new Set(
  readdirSync(LOGOS_DIR)
    .filter(f => f.endsWith('.svg'))
    .map(f => f.replace('.svg', ''))
)

const rows = REGION_ORDER
  .filter(slug => savedSlugs.has(slug))
  .map((slug, i) => {
    const name = ALL_NAMES[slug] ?? slug
    const safeName = name.replace(/'/g, "''")
    return `  ('${safeName}', '${slug}', '${slug}.svg', ${i + 1})`
  })

const sql = `-- Auto-generated by scripts/fetch-logos-retry.mjs
-- Paste into the Supabase SQL editor.
-- Deletes existing manufacturers rows first.

DELETE FROM public.manufacturers;

INSERT INTO public.manufacturers (name, slug, logo_filename, display_order) VALUES
${rows.join(',\n')};
`

writeFileSync(join(__dirname, 'manufacturers-seed.sql'), sql, 'utf8')
console.log(`\nSQL updated → scripts/manufacturers-seed.sql (${rows.length} rows)\n`)
