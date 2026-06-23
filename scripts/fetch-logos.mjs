/**
 * Fetches manufacturer SVG logos from Wikimedia Commons.
 * Usage: node scripts/fetch-logos.mjs
 *
 * Uses Special:FilePath redirects so we only need the Commons filename,
 * not the internal MD5-hashed path. Falls back to up to 2 alt filenames
 * per manufacturer before marking as unavailable.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const LOGOS_DIR = join(ROOT, 'public', 'logos')
mkdirSync(LOGOS_DIR, { recursive: true })

// Special:FilePath resolves to the actual file URL regardless of internal path.
const wiki = (filename) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`

// Each entry: [displayName, slug, [primary, alt1, alt2, ...]]
// Region order: UK first, then German, French, Italian, Swedish, Japanese,
// American, Korean, Dutch, Czech, Romanian, Spanish, Chinese.
const MANUFACTURERS = [
  // ── UK ────────────────────────────────────────────────────────────────
  ['Land Rover',    'land-rover',    ['Land_Rover_logo.svg', 'Land_Rover_logo_(without_background).svg', 'Land_rover_logo.svg']],
  ['Jaguar',        'jaguar',        ['Jaguar_Cars_logo.svg', 'Jaguar_logo.svg', 'Jaguar_cars_logo.svg']],
  ['Bentley',       'bentley',       ['Bentley_logo.svg', 'Bentley_Motors_logo.svg', 'Bentley_Logo.svg']],
  ['Rolls-Royce',   'rolls-royce',   ['Rolls-Royce_Motor_Cars_logo.svg', 'Rolls-Royce_logo.svg', 'Rolls_Royce_logo.svg']],
  ['Aston Martin',  'aston-martin',  ['Aston_Martin_logo.svg', 'Aston_Martin_Lagonda_logo.svg', 'Aston_martin_logo.svg']],
  ['McLaren',       'mclaren',       ['McLaren_Automotive_logo.svg', 'McLaren_logo.svg', 'Mclaren_logo.svg']],
  ['Lotus',         'lotus',         ['Lotus_logo.svg', 'Lotus_Cars_logo.svg', 'Group_Lotus_logo.svg']],
  ['Morgan',        'morgan',        ['Morgan_Motor_Company_logo.svg', 'Morgan_Motor_logo.svg', 'Morgan_logo.svg']],
  ['Mini',          'mini',          ['Mini_logo.svg', 'MINI_logo.svg', 'MINI_Logo_2018.svg']],
  ['MG',            'mg',            ['MG_Motor_UK_logo.svg', 'MG_logo.svg', 'MG_brand_logo.svg']],
  ['TVR',           'tvr',           ['TVR_logo.svg', 'TVR_car_logo.svg', 'Tvr_logo.svg']],
  ['Noble',         'noble',         ['Noble_Automotive_logo.svg', 'Noble_logo.svg', 'Noble_M600_logo.svg']],
  ['Caterham',      'caterham',      ['Caterham_Cars_logo.svg', 'Caterham_logo.svg', 'Caterham_cars_logo.svg']],

  // ── German ────────────────────────────────────────────────────────────
  ['BMW',           'bmw',           ['BMW.svg', 'BMW_logo_(gray).svg', 'BMW_logo_2020.svg']],
  ['Mercedes-Benz', 'mercedes-benz', ['Mercedes-Benz_Logo_2010.svg', 'Mercedes-Benz_logo.svg', 'Mercedes_Benz_logo.svg']],
  ['Audi',          'audi',          ['Audi_logo.svg', 'Audi_Logo_2016.svg', 'Audi_logo_detail.svg']],
  ['Volkswagen',    'volkswagen',    ['Volkswagen_logo_2019.svg', 'Volkswagen_logo.svg', 'VW_logo_2019.svg']],
  ['Porsche',       'porsche',       ['Porsche_logo.svg', 'Porsche_Logo_Colour.svg', 'Logo_Porsche.svg']],
  ['Opel',          'opel',          ['Opel_logo_2017.svg', 'Opel_logo.svg', 'Opel_Logo.svg']],

  // ── French ────────────────────────────────────────────────────────────
  ['Bugatti',       'bugatti',       ['Bugatti_logo.svg', 'Bugatti_Logo.svg', 'Bugatti_Automobiles_logo.svg']],
  ['Citroën',       'citroen',       ['Citroën_logo.svg', 'Citroen_logo.svg', 'Logo_Citroën.svg']],
  ['DS',            'ds',            ['DS_Automobiles_logo.svg', 'DS_logo.svg', 'DS_Automobiles_logo_2016.svg']],
  ['Peugeot',       'peugeot',       ['Peugeot_logo.svg', 'Peugeot_2021_logo.svg', 'Logo_Peugeot.svg']],
  ['Renault',       'renault',       ['Renault_2021_Text.svg', 'Renault_logo.svg', 'Renault_2009_logo.svg']],

  // ── Italian ───────────────────────────────────────────────────────────
  ['Alfa Romeo',    'alfa-romeo',    ['Alfa_Romeo_logo.svg', 'Alfa_Romeo_2015_logo.svg', 'New_Alfa_Romeo_logo.svg']],
  ['Ferrari',       'ferrari',       ['Ferrari_logo_red.svg', 'Ferrari_logo.svg', 'Scuderia_Ferrari_Logo.svg']],
  ['Fiat',          'fiat',          ['Fiat_logo.svg', 'Fiat_logo_2020.svg', 'New_Fiat_Logo.svg']],
  ['Lamborghini',   'lamborghini',   ['Lamborghini_logo.svg', 'Automobili_Lamborghini_logo.svg', 'Lamborghini_Logo.svg']],
  ['Lancia',        'lancia',        ['Lancia_logo.svg', 'Lancia_Logo.svg', 'Lancia_2023_logo.svg']],
  ['Maserati',      'maserati',      ['Maserati_logo.svg', 'Maserati_Logo.svg', 'Maserati_2020_logo.svg']],
  ['Pagani',        'pagani',        ['Pagani_logo.svg', 'Pagani_Automobili_logo.svg', 'Pagani_Logo.svg']],

  // ── Swedish ───────────────────────────────────────────────────────────
  ['Koenigsegg',    'koenigsegg',    ['Koenigsegg_logo.svg', 'Koenigsegg_Automotive_logo.svg', 'Koenigsegg_Logo.svg']],
  ['Saab',          'saab',          ['Saab_logo.svg', 'Saab_Automobile_logo.svg', 'SAAB_logo.svg']],
  ['Volvo',         'volvo',         ['Volvo_logo.svg', 'Volvo_Cars_logo.svg', 'Volvo_logo_2014.svg']],

  // ── Japanese ──────────────────────────────────────────────────────────
  ['Acura',         'acura',         ['Acura_logo.svg', 'Acura_Logo.svg', 'Acura_logo_2018.svg']],
  ['Daihatsu',      'daihatsu',      ['Daihatsu_logo.svg', 'Daihatsu_Logo.svg', 'Daihatsu_logo_2011.svg']],
  ['Honda',         'honda',         ['Honda-logo.svg', 'Honda_logo.svg', 'Honda_Logo.svg']],
  ['Infiniti',      'infiniti',      ['Infiniti_logo.svg', 'Infiniti_Logo.svg', 'Infiniti_logo_2012.svg']],
  ['Isuzu',         'isuzu',         ['Isuzu_Motors_logo.svg', 'Isuzu_logo.svg', 'Isuzu_Logo.svg']],
  ['Lexus',         'lexus',         ['Lexus_division_emblem.svg', 'Lexus_logo.svg', 'Lexus_Logo.svg']],
  ['Mazda',         'mazda',         ['Mazda_logo.svg', 'Mazda_Motor_logo.svg', 'Mazda_Logo.svg']],
  ['Mitsubishi',    'mitsubishi',    ['Mitsubishi_motors_new_logo.svg', 'Mitsubishi_Motors_logo.svg', 'Mitsubishi_logo.svg']],
  ['Nissan',        'nissan',        ['Nissan_2020_logo.svg', 'Nissan_logo.svg', 'Nissan_Logo.svg']],
  ['Subaru',        'subaru',        ['Subaru_Corporation_logo.svg', 'Subaru_logo.svg', 'Subaru_Logo.svg']],
  ['Suzuki',        'suzuki',        ['Suzuki_logo_2.svg', 'Suzuki_logo.svg', 'Suzuki_Logo.svg']],
  ['Toyota',        'toyota',        ['Toyota_logo_(Red).svg', 'Toyota_logo.svg', 'Toyota_Logo.svg']],

  // ── American ──────────────────────────────────────────────────────────
  ['Buick',         'buick',         ['Buick_logo.svg', 'Buick_Logo.svg', 'Buick_logo_2022.svg']],
  ['Cadillac',      'cadillac',      ['Cadillac_logo.svg', 'Cadillac_Logo.svg', 'Cadillac_logo_2014.svg']],
  ['Chevrolet',     'chevrolet',     ['Chevrolet_logo.svg', 'Chevrolet_Logo.svg', 'Chevrolet_bowtie_logo.svg']],
  ['Chrysler',      'chrysler',      ['Chrysler_logo.svg', 'Chrysler_Logo.svg', 'Chrysler_logo_2010.svg']],
  ['Dodge',         'dodge',         ['Dodge_logo.svg', 'Dodge_Logo.svg', 'Dodge_logo_2010.svg']],
  ['Ford',          'ford',          ['Ford_logo_flat.svg', 'Ford_logo.svg', 'Ford_Motor_Company_Logo.svg']],
  ['GMC',           'gmc',           ['GMC_logo.svg', 'GMC_Logo.svg', 'GMC_logo_2011.svg']],
  ['Jeep',          'jeep',          ['Jeep_logo.svg', 'Jeep_Logo.svg', 'Jeep_wordmark.svg']],
  ['Lincoln',       'lincoln',       ['Lincoln_motor_logo.svg', 'Lincoln_logo.svg', 'Lincoln_Motor_Company_logo.svg']],
  ['Lucid',         'lucid',         ['Lucid_Motors_logo.svg', 'Lucid_logo.svg', 'Lucid_Motors_Logo.svg']],
  ['RAM',           'ram',           ['Ram_logo.svg', 'RAM_logo.svg', 'Ram_Trucks_logo.svg']],
  ['Rivian',        'rivian',        ['Rivian_logo.svg', 'Rivian_Logo.svg', 'Rivian_Automotive_logo.svg']],
  ['Tesla',         'tesla',         ['Tesla_Motors.svg', 'Tesla_logo.svg', 'Tesla_Logo.svg']],

  // ── Korean ────────────────────────────────────────────────────────────
  ['Genesis',       'genesis',       ['Genesis_Motor_logo.svg', 'Genesis_logo.svg', 'Genesis_Motors_logo.svg']],
  ['Hyundai',       'hyundai',       ['Hyundai_Motor_Company_logo.svg', 'Hyundai_logo.svg', 'Hyundai_Logo.svg']],
  ['Kia',           'kia',           ['Kia_logo2.svg', 'Kia_logo.svg', 'Kia_Motors_logo.svg']],

  // ── Dutch ─────────────────────────────────────────────────────────────
  ['Donkervoort',   'donkervoort',   ['Donkervoort_logo.svg', 'Donkervoort_Automobielen_logo.svg', 'Donkervoort_Logo.svg']],

  // ── Czech ─────────────────────────────────────────────────────────────
  ['Skoda',         'skoda',         ['Skoda_Auto_logo.svg', 'Skoda_logo.svg', 'Škoda_Auto_logo_2016.svg']],

  // ── Romanian ──────────────────────────────────────────────────────────
  ['Dacia',         'dacia',         ['Dacia_logo.svg', 'Dacia_Logo.svg', 'Dacia_logo_2021.svg']],

  // ── Spanish ───────────────────────────────────────────────────────────
  ['Cupra',         'cupra',         ['Cupra_logo.svg', 'CUPRA_logo.svg', 'Cupra_brand_logo.svg']],
  ['SEAT',          'seat',          ['SEAT_logo.svg', 'Seat_logo.svg', 'SEAT_Logo_2012.svg']],

  // ── Chinese ───────────────────────────────────────────────────────────
  ['BYD',           'byd',           ['BYD_logo.svg', 'BYD_Auto_logo.svg', 'BYD_Logo.svg']],
  ['Geely',         'geely',         ['Geely_logo.svg', 'Geely_Auto_logo.svg', 'Geely_Logo.svg']],
  ['NIO',           'nio',           ['NIO_logo.svg', 'NIO_Logo.svg', 'Nio_logo.svg']],
  ['Xpeng',         'xpeng',         ['Xpeng_logo.svg', 'XPeng_logo.svg', 'XPENG_logo.svg']],
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

  if (!looksLikeSvg) {
    return { ok: false, reason: `Not SVG (content-type: ${ct})` }
  }

  if (text.length < 100) {
    return { ok: false, reason: `SVG too small (${text.length} bytes) — likely a placeholder` }
  }

  return { ok: true, svg: text, finalUrl: res.url }
}

function isSvgUsable(svg) {
  // Reject raster-only SVGs that just wrap a PNG/JPG
  const hasVectorContent =
    /<(path|circle|rect|polygon|polyline|line|ellipse|g|text|use)\b/i.test(svg)
  return hasVectorContent
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const successes = []
const failures  = []

console.log(`\nFetching logos for ${MANUFACTURERS.length} manufacturers...\n`)
console.log('='.repeat(72))

for (const [name, slug, filenames] of MANUFACTURERS) {
  let fetched = false

  for (let i = 0; i < filenames.length; i++) {
    const filename = filenames[i]
    const url = wiki(filename)
    const label = i === 0 ? 'PRIMARY' : `ALT ${i}   `
    process.stdout.write(`  ${label}  ${name.padEnd(16)} ${filename} … `)

    const result = await fetchSvg(url)

    if (!result.ok) {
      console.log(`✗  ${result.reason}`)
      continue
    }

    if (!isSvgUsable(result.svg)) {
      console.log(`✗  No vector content (raster-only SVG)`)
      continue
    }

    const dest = join(LOGOS_DIR, `${slug}.svg`)
    writeFileSync(dest, result.svg, 'utf8')
    console.log(`✓  saved → public/logos/${slug}.svg (${Math.round(result.svg.length / 1024)}kB)`)
    successes.push({ name, slug, filename: `${slug}.svg`, source: filename, attempt: i + 1 })
    fetched = true
    break
  }

  if (!fetched) {
    console.log(`  FAILED   ${name.padEnd(16)} — tried: ${filenames.join(', ')}`)
    failures.push({ name, slug, tried: filenames })
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log('\n' + '='.repeat(72))
console.log(`\n✓ ${successes.length} logos downloaded successfully`)
console.log(`✗ ${failures.length} logos unavailable\n`)

if (failures.length > 0) {
  console.log('Failed manufacturers:')
  for (const f of failures) {
    console.log(`  • ${f.name} (${f.slug})`)
    for (const t of f.tried) console.log(`      tried: ${wiki(t)}`)
  }
  console.log()
}

// ─── SQL generation ───────────────────────────────────────────────────────────

// display_order: UK first (1–13), then alphabetical by region block
// The MANUFACTURERS array is already in display order.
const DISPLAY_ORDER_MAP = Object.fromEntries(
  MANUFACTURERS.map(([, slug], i) => [slug, i + 1])
)

const rows = successes.map(({ name, slug, filename }) => {
  const order = DISPLAY_ORDER_MAP[slug]
  const safeName = name.replace(/'/g, "''")
  return `  ('${safeName}', '${slug}', '${filename}', ${order})`
})

const sql = `-- Auto-generated by scripts/fetch-logos.mjs
-- Paste into the Supabase SQL editor.
-- If manufacturers already exist from the previous migration, run the
-- DELETE first; otherwise omit it.

DELETE FROM public.manufacturers;

INSERT INTO public.manufacturers (name, slug, logo_filename, display_order) VALUES
${rows.join(',\n')};
`

const sqlPath = join(__dirname, 'manufacturers-seed.sql')
writeFileSync(sqlPath, sql, 'utf8')
console.log(`SQL written to scripts/manufacturers-seed.sql (${successes.length} rows)\n`)
