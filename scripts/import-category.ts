#!/usr/bin/env npx ts-node
/**
 * THE RESIDENTIALIST — Category Import Script
 *
 * Reads pipeline output (config.json + investigator .md files) and upserts
 * into PostgreSQL.
 *
 * Usage:
 *   npx ts-node scripts/import-category.ts --category=sinks
 *   npx ts-node scripts/import-category.ts --all
 *
 * Required env:
 *   DATABASE_URL     PostgreSQL connection string
 *   PIPELINE_ROOT    Path to the residentialist pipeline directory
 *                    e.g. /Users/Residentialist/.openclaw/workspace/residentialist
 */

import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';

// ─── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const categoryArg = args.find((a) => a.startsWith('--category='))?.split('=')[1];
const importAll = args.includes('--all');
const dryRun = args.includes('--dry-run');

if (!categoryArg && !importAll) {
  console.error('Usage: import-category.ts --category=<slug> | --all [--dry-run]');
  process.exit(1);
}

// ─── Environment ──────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL;
const PIPELINE_ROOT = process.env.PIPELINE_ROOT || path.join(__dirname, '../../residentialist');

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// ─── Tier system ──────────────────────────────────────────────────────────────

const TIER_LABELS: Record<number, string> = {
  1: 'Best in Class',
  2: 'Excellent',
  3: 'Good',
  4: 'Fair',
  5: 'Below Standard',
};

function tierFromScore(score: number): number {
  if (score >= 90) return 1;
  if (score >= 75) return 2;
  if (score >= 60) return 3;
  if (score >= 40) return 4;
  return 5;
}

// ─── Spec controlled-vocabulary translation ───────────────────────────────────
// Maps pipeline controlled-vocab values to human-readable display strings.
// Expand this as more category spec schemas are added.

const SPEC_VOCAB: Record<string, string> = {
  // Materials
  stainless_16_gauge_t304: '16-gauge T-304 Stainless Steel',
  stainless_18_gauge: '18-gauge Stainless Steel',
  stainless_22_gauge_plus: '22-gauge Stainless Steel',
  vitreous_china_standard: 'Vitreous China',
  fireclay_handcrafted: 'Handcrafted Fireclay',
  fireclay_mass_produced: 'Mass-Produced Fireclay',
  neoroc_composite: 'Neoroc Composite (Kohler)',
  silgranit_composite: 'Silgranit Composite (Blanco)',
  cast_iron_porcelain: 'Cast Iron with Porcelain Enamel',
  white_body_porcelain: 'White-Body Porcelain',
  color_body_porcelain: 'Color-Body Porcelain',
  white_body_ceramic: 'White-Body Ceramic',
  red_body_ceramic: 'Red-Body Ceramic',
  // Construction
  tight_radius_welded: 'Tight-Radius Welded',
  drawn_pressed_single_sheet: 'Drawn & Pressed Single Sheet',
  stamped_mass_production: 'Stamped (Mass Production)',
  handcrafted_individual_kiln: 'Handcrafted, Individual Kiln-Fired',
  cast_production: 'Cast Production',
  // Surface / finish
  brushed_satin_commercial: 'Brushed Satin (Commercial Grade)',
  standard_glaze: 'Standard Glaze',
  premium_glaze_fireclay: 'Premium Fireclay Glaze',
  matte_composite_finish: 'Matte Composite Finish',
  basic_unfinished: 'Unfinished / Basic',
  standard_digital_inkjet: 'Digital Inkjet Print',
  advanced_digital_inkjet: 'Advanced Digital Inkjet Print',
  screen_printed: 'Screen-Printed',
  // Sound deadening
  full_coverage_pad_and_spray: 'Full Coverage Pad & Spray Coating',
  partial_pad: 'Partial Sound Deadening Pad',
  none: 'None',
  not_applicable_mass_body: 'N/A (Mass Body)',
  // Mounting
  undermount: 'Undermount',
  farmhouse_apron: 'Farmhouse / Apron Front',
  drop_in_self_rimming: 'Drop-In / Self-Rimming',
  vessel: 'Vessel',
  wall_mount: 'Wall Mount',
  // Source traceability
  single_source_identified: 'Single-Source Manufacturing',
  multi_source_identified: 'Multi-Source Manufacturing',
  unknown_or_undisclosed: 'Unknown / Undisclosed',
  unknown_or_undisclosed_oem: 'Unknown OEM Source',
  // Drain engineering
  sloped_bottom_rear_drain: 'Sloped Bottom — Rear Drain',
  standard_center_drain: 'Standard Center Drain',
  flat_bottom_poor_drainage: 'Flat Bottom (Poor Drainage)',
  not_applicable_bathroom: 'N/A (Bathroom Sink)',
  // Depth
  'deep_10_plus_inches': '10"+ Deep Basin',
  'standard_8_to_9_inches': '8"–9" Standard Depth',
  'shallow_under_8_inches': 'Under 8" Shallow',
  // Workstation
  accessory_compatible: 'Accessory-Compatible (Cutting Board, Colander)',
  full_workstation_included: 'Full Workstation Including Accessories',
  none_no_workstation: 'None',
  // Longevity
  heirloom_50_plus_years: 'Heirloom Quality (50+ Years)',
  'long_term_25_to_50_years': '25–50 Years',
  'short_term_under_15': 'Under 15 Years',
  // Chip / crack resistance
  excellent_inherent: 'Excellent (Inherent to Material)',
  good_engineered: 'Good (Engineered)',
  moderate_prone_to_chips: 'Moderate — Prone to Chips',
  'poor_known_issues': 'Poor — Known Issues',
  // Stain resistance
  non_porous_inherent: 'Non-Porous (Inherent)',
  susceptible: 'Susceptible to Staining',
  // Heat resistance
  'extreme_500_plus_f': '500°F+',
  'good_300_to_500_f': '300°F–500°F',
  'limited_under_200_f': 'Under 200°F (Limited)',
  // Warranty
  lifetime_limited: 'Lifetime Limited',
  lifetime_full: 'Lifetime Full',
  'under_10': 'Under 10 Years',
  '25_year': '25 Years',
  '5_year': '5 Years',
  '1_year': '1 Year',
  under_10_or_none: 'Under 10 Years / None',
  // Parts ecosystem
  universal_widely_available: 'Universal — Widely Available',
  proprietary_manufacturer_only: 'Proprietary (Manufacturer Only)',
  limited_regional: 'Limited / Regional',
  // Tile-specific
  rectified_precise: 'Rectified (Precision Cut)',
  rectified_standard: 'Rectified',
  calibrated_standard: 'Calibrated (Sorted)',
  non_rectified_pressed_edge: 'Non-Rectified (Pressed Edge)',
  // Tile origins
  us_manufacturing_identified: 'US Manufacturing',
  italy_identified: 'Italian Manufacturing',
  spain_identified: 'Spanish Manufacturing',
  global_multi_source: 'Global / Multi-Source',
  // PEI ratings
  class_5_heavy_traffic: 'Class 5 — Heavy Commercial Traffic',
  class_4_moderate_to_heavy: 'Class 4 — Moderate to Heavy Residential',
  class_3_light_to_moderate: 'Class 3 — Light to Moderate Residential',
  class_2_light_traffic: 'Class 2 — Light Traffic Only',
  class_1_no_foot_traffic: 'Class 1 — No Foot Traffic',
  // DCOF
  'premium_0_60_plus': '≥0.60 (Wet Area Rated)',
  'standard_0_42_to_0_59': '0.42–0.59 (Meets ANSI A137.1)',
  // Water absorption
  'impervious_under_0_5': 'Impervious (<0.5%)',
  'vitreous_0_5_to_3': 'Vitreous (0.5%–3%)',
  'semi_vitreous_3_to_7': 'Semi-Vitreous (3%–7%)',
  // Breaking strength
  'premium_2000_plus_n': '2000+ N (Premium)',
  'standard_1300_to_2000_n': '1300–2000 N (Standard)',
  'low_under_1300_n': 'Under 1300 N (Low)',
  // Freeze-thaw
  certified_frost_resistant: 'Certified Frost-Resistant',
  not_applicable_interior_only: 'N/A — Interior Only',
  not_rated_fails: 'Not Rated / Fails',
  // Scratch resistance (Mohs)
  'premium_7_plus': 'Mohs 7+ (Premium)',
  'standard_5_to_6': 'Mohs 5–6 (Standard)',
  'low_under_5': 'Mohs <5 (Low)',
  // Chemical resistance
  excellent_class_a: 'Excellent (Class A)',
  good_class_b: 'Good (Class B)',
  fair_class_c: 'Fair (Class C)',
  // Stain resistance tile
  stain_resistant_class_d: 'Stain Resistant (Class D+)',
  good_standard_glaze: 'Good — Standard Glaze',
  moderate_porous_surface: 'Moderate — Porous Surface',
};

function translateSpecValue(value: string | number | boolean): string {
  const str = String(value);
  return SPEC_VOCAB[str] ?? str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function translateSpecName(key: string): string {
  const NAME_MAP: Record<string, string> = {
    body_material: 'Body Material',
    body_composition: 'Body Composition',
    construction_method: 'Construction Method',
    surface_finish_technology: 'Surface Finish',
    surface_technology: 'Surface Technology',
    sound_deadening: 'Sound Deadening',
    mounting_type: 'Mounting Type',
    source_traceability: 'Manufacturing Source',
    drain_engineering: 'Drain Engineering',
    basin_depth: 'Basin Depth',
    workstation_integration: 'Workstation Integration',
    material_longevity: 'Expected Lifespan',
    chip_crack_resistance: 'Chip/Crack Resistance',
    stain_resistance: 'Stain Resistance',
    heat_resistance: 'Heat Resistance',
    warranty_years: 'Warranty',
    parts_and_accessories_ecosystem: 'Parts Availability',
    rectification_precision: 'Edge Precision',
    manufacturing_origin: 'Manufacturing Origin',
    pei_rating: 'PEI Wear Rating',
    dcof_slip_resistance: 'DCOF Slip Resistance',
    water_absorption_pct: 'Water Absorption',
    format_size: 'Tile Format / Size',
    breaking_strength: 'Breaking Strength',
    freeze_thaw_resistance: 'Freeze-Thaw Resistance',
    scratch_resistance_mohs: 'Scratch Resistance (Mohs)',
    chemical_resistance: 'Chemical Resistance',
    // Toilet-specific
    flush_technology: 'Flush Technology',
    map_score_grams: 'MAP Score',
    gpf_flush_volume: 'Flush Volume (GPF)',
    trapway_diameter: 'Trapway Diameter',
    bowl_shape: 'Bowl Shape',
    seat_height: 'Seat Height',
    rim_wash_coverage: 'Rim Wash Coverage',
    certifications: 'Certifications',
  };
  return NAME_MAP[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Which spec keys are "key specs" shown prominently (first ~4-5)
const KEY_SPEC_KEYS = new Set([
  'body_material', 'body_composition', 'mounting_type', 'basin_depth',
  'warranty_years', 'source_traceability', 'material_longevity',
  'pei_rating', 'dcof_slip_resistance', 'water_absorption_pct', 'flush_technology',
  'map_score_grams', 'gpf_flush_volume',
]);

// ─── Markdown parser ──────────────────────────────────────────────────────────

interface InvestigatorData {
  name: string;
  composite_score: number;
  tier: number;
  quality_score: number | null;
  durability_score: number | null;
  performance_score: number | null;
  material_safety: string | null;
  company_background: string | null;
  strengths: string[];
  deficiencies: string[];
  summary: string | null;
  platform_disclosure: string | null;
  outlook: string | null;
  outlook_rationale: string | null;
  warranty_summary: string | null;
}

function parseInvestigatorReport(md: string): Partial<InvestigatorData> {
  const data: Partial<InvestigatorData> = {};

  // Header: "## Product Name — Investigator Analysis"
  const nameMatch = md.match(/^##\s+(.+?)\s+—\s+Investigator Analysis/m);
  if (nameMatch) data.name = nameMatch[1].trim();

  // Locked score: "**Locked Score: 91/100 — Tier 1**"
  const scoreMatch = md.match(/\*\*Locked Score:\s*(\d+)\/100\s*—\s*Tier\s*(\d+)/i);
  if (scoreMatch) {
    data.composite_score = parseInt(scoreMatch[1]);
    data.tier = parseInt(scoreMatch[2]);
  }

  // Score decomposition table
  const tableSection = md.match(/###\s+Score Decomposition[\s\S]*?(?=###|$)/);
  if (tableSection) {
    const rows = tableSection[0].match(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|[^|]+\|[^|]+\|/g) || [];
    for (const row of rows) {
      const cells = row.split('|').map((c) => c.trim()).filter(Boolean);
      if (cells.length < 2) continue;
      const axis = cells[0].toLowerCase();
      const scoreStr = cells[1];
      const score = parseFloat(scoreStr);
      if (isNaN(score)) continue;
      // Axis scores may be on 0-10 or 0-100 scale
      const normalized = score <= 10 ? score * 10 : score;
      if (axis.includes('quality')) data.quality_score = normalized;
      else if (axis.includes('durability')) data.durability_score = normalized;
      else if (axis.includes('performance')) data.performance_score = normalized;
      else if (axis.includes('material safety')) data.material_safety = scoreStr;
    }
  }

  // Section extractor helper
  function extractSection(sectionName: string): string | null {
    const re = new RegExp(`###\\s+${sectionName}\\s*\\n([\\s\\S]*?)(?=###|$)`, 'i');
    const m = md.match(re);
    return m ? m[1].trim() : null;
  }

  // Company Background
  data.company_background = extractSection('Company Background');

  // Strengths — parse bullet list
  const strengthsSec = extractSection('Strengths');
  if (strengthsSec) {
    data.strengths = strengthsSec
      .split('\n')
      .filter((l) => l.trim().startsWith('-'))
      .map((l) => l.replace(/^-\s*\*\*[^*]+\*\*:?\s*/, '').replace(/^-\s*/, '').trim())
      .filter(Boolean);
  }

  // Deficiencies — parse bullet list
  const deficienciesSec = extractSection('Deficiencies');
  if (deficienciesSec) {
    data.deficiencies = deficienciesSec
      .split('\n')
      .filter((l) => l.trim().startsWith('-'))
      .map((l) => l.replace(/^-\s*\*\*[^*]+\*\*:?\s*/, '').replace(/^-\s*/, '').trim())
      .filter(Boolean);
  }

  // What You Should Know = summary
  data.summary = extractSection('What You Should Know');

  // Platform Disclosure
  const platformSec = extractSection('Platform Disclosure');
  if (platformSec && !platformSec.toLowerCase().includes('not applicable')) {
    data.platform_disclosure = platformSec;
  }

  // Corporate Outlook — "Stable — rationale text"
  const outlookSec = extractSection('Corporate Outlook');
  if (outlookSec) {
    const dashIdx = outlookSec.indexOf('—');
    if (dashIdx > -1) {
      data.outlook = outlookSec.substring(0, dashIdx).trim();
      data.outlook_rationale = outlookSec.substring(dashIdx + 1).trim();
    } else {
      // Try to match known outlook values
      const outlookMatch = outlookSec.match(/^(Strong|Stable|Conditional|Negative)/i);
      if (outlookMatch) {
        data.outlook = outlookMatch[1];
        data.outlook_rationale = outlookSec.replace(outlookMatch[1], '').trim();
      } else {
        data.outlook_rationale = outlookSec;
      }
    }
  }

  // Repair Economics / Warranty (mapped to warranty_summary)
  data.warranty_summary = extractSection('Repair Economics');

  return data;
}

// ─── Config reader ────────────────────────────────────────────────────────────

interface ConfigProduct {
  name: string;
  slug: string;
  tier: number;
  target: number;
  sub_type?: string;
  axis_scores?: { quality: number; durability: number; performance: number };
  axis_scores_tbd?: boolean;
  specs?: Record<string, string>;
  outlook?: string;
  outlook_rationale?: string;
  corporate_parent?: string;
  award?: 'recommended' | 'generational';
}

interface CategoryConfig {
  category: string;
  axis_weights?: { quality: number; durability: number; performance: number };
  weights?: { quality: number; durability: number; performance: number };
  calibration_products: ConfigProduct[];
}

function readConfig(categorySlug: string): CategoryConfig {
  const configPath = path.join(PIPELINE_ROOT, 'calibration', categorySlug, 'config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config not found: ${configPath}`);
  }
  const raw = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(raw);
}

function readInvestigatorReport(categorySlug: string, productSlug: string): string | null {
  const filePath = path.join(
    PIPELINE_ROOT,
    'output',
    'investigators',
    categorySlug,
    `investigator_${categorySlug}_${productSlug}.md`
  );
  if (!fs.existsSync(filePath)) {
    console.warn(`  [WARN] No investigator report: ${filePath}`);
    return null;
  }
  return fs.readFileSync(filePath, 'utf-8');
}

// ─── Database upsert ──────────────────────────────────────────────────────────

async function upsertCategory(config: CategoryConfig): Promise<string> {
  const weights = config.axis_weights ?? config.weights;
  const slug = config.category;

  // Derive category name from slug
  const name = slug
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const result = await pool.query(
    `INSERT INTO categories (name, slug, axis_weight_quality, axis_weight_durability, axis_weight_performance)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (slug) DO UPDATE SET
       axis_weight_quality    = EXCLUDED.axis_weight_quality,
       axis_weight_durability = EXCLUDED.axis_weight_durability,
       axis_weight_performance = EXCLUDED.axis_weight_performance,
       updated_at             = NOW()
     RETURNING id`,
    [
      name,
      slug,
      weights?.quality ?? null,
      weights?.durability ?? null,
      weights?.performance ?? null,
    ]
  );
  return result.rows[0].id;
}

async function upsertProduct(
  categoryId: string,
  categorySlug: string,
  configProduct: ConfigProduct,
  investigator: Partial<InvestigatorData>
): Promise<string> {
  // Merge config data with investigator data — investigator wins for text fields
  const compositeScore = configProduct.target;
  const tier = configProduct.tier ?? tierFromScore(compositeScore);
  const tierLabel = TIER_LABELS[tier] ?? 'Unknown';

  // Axis scores: prefer config (0-100 normalized) > investigator > null
  let qualityScore: number | null = null;
  let durabilityScore: number | null = null;
  let performanceScore: number | null = null;

  if (configProduct.axis_scores && !configProduct.axis_scores_tbd) {
    const q = configProduct.axis_scores.quality;
    const d = configProduct.axis_scores.durability;
    const p = configProduct.axis_scores.performance;
    // Normalize from 0-10 to 0-100 if needed
    qualityScore = q <= 10 ? q * 10 : q;
    durabilityScore = d <= 10 ? d * 10 : d;
    performanceScore = p <= 10 ? p * 10 : p;
  } else if (investigator.quality_score != null) {
    qualityScore = investigator.quality_score;
    durabilityScore = investigator.durability_score ?? null;
    performanceScore = investigator.performance_score ?? null;
  }

  // Brand: first word(s) of product name — heuristic
  const brand = extractBrand(configProduct.name);

  const summary = investigator.summary ?? configProduct.name;
  const outlook = investigator.outlook ?? configProduct.outlook ?? null;
  const outlookRationale = investigator.outlook_rationale ?? configProduct.outlook_rationale ?? null;

  const result = await pool.query(
    `INSERT INTO products (
       category_id, name, brand, slug, sub_type,
       composite_score, tier, tier_label,
       quality_score, durability_score, performance_score,
       award, summary, company_background, strengths, deficiencies,
       outlook, outlook_rationale, platform_disclosure,
       warranty_summary, material_safety
     ) VALUES (
       $1,$2,$3,$4,$5,
       $6,$7,$8,
       $9,$10,$11,
       $12,$13,$14,$15,$16,
       $17,$18,$19,
       $20,$21
     )
     ON CONFLICT (slug) DO UPDATE SET
       category_id       = EXCLUDED.category_id,
       name              = EXCLUDED.name,
       brand             = EXCLUDED.brand,
       sub_type          = EXCLUDED.sub_type,
       composite_score   = EXCLUDED.composite_score,
       tier              = EXCLUDED.tier,
       tier_label        = EXCLUDED.tier_label,
       quality_score     = EXCLUDED.quality_score,
       durability_score  = EXCLUDED.durability_score,
       performance_score = EXCLUDED.performance_score,
       award             = EXCLUDED.award,
       summary           = EXCLUDED.summary,
       company_background = EXCLUDED.company_background,
       strengths         = EXCLUDED.strengths,
       deficiencies      = EXCLUDED.deficiencies,
       outlook           = EXCLUDED.outlook,
       outlook_rationale = EXCLUDED.outlook_rationale,
       platform_disclosure = EXCLUDED.platform_disclosure,
       warranty_summary  = EXCLUDED.warranty_summary,
       material_safety   = EXCLUDED.material_safety,
       updated_at        = NOW()
     RETURNING id`,
    [
      categoryId,
      configProduct.name,
      brand,
      configProduct.slug,
      configProduct.sub_type ?? null,
      compositeScore,
      tier,
      tierLabel,
      qualityScore,
      durabilityScore,
      performanceScore,
      configProduct.award ?? null,
      summary,
      investigator.company_background ?? null,
      investigator.strengths ?? [],
      investigator.deficiencies ?? [],
      outlook,
      outlookRationale,
      investigator.platform_disclosure ?? null,
      investigator.warranty_summary ?? null,
      investigator.material_safety ?? null,
    ]
  );
  return result.rows[0].id;
}

async function upsertSpecs(
  productId: string,
  specs: Record<string, string>
): Promise<void> {
  const entries = Object.entries(specs);
  if (entries.length === 0) return;

  // DELETE + single batched INSERT — minimizes round trips to Supabase
  await pool.query(`DELETE FROM product_specs WHERE product_id = $1`, [productId]);

  // Build a single multi-value INSERT: ($1,$2,$3,$4,$5),($1,$6,$7,$8,$9),...
  const values: any[] = [];
  const placeholders: string[] = [];
  let paramIdx = 1;

  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    const specName = translateSpecName(key);
    const specValue = translateSpecValue(value);
    const isKey = KEY_SPEC_KEYS.has(key);

    placeholders.push(
      `($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`
    );
    values.push(productId, specName, specValue, i, isKey);
  }

  await pool.query(
    `INSERT INTO product_specs (product_id, spec_name, spec_value, display_order, is_key_spec)
     VALUES ${placeholders.join(', ')}`,
    values
  );
}

// ─── Brand extractor ──────────────────────────────────────────────────────────

const KNOWN_BRANDS = [
  'Rohl', 'Kohler', 'Blanco', 'Kraus', 'Glacier Bay', 'American Standard',
  'Toto', 'Gerber', 'Porcelanosa', 'Crossville', 'Daltile', 'Marazzi',
  'MSI', 'American Olean', 'Merola', 'Wolf', 'Vent-A-Hood', 'Zephyr',
  'Thermador', 'Broan', 'Marvin', 'Andersen', 'Pella', 'Milgard', 'JELD-WEN',
  'Cambria', 'Dekton', 'Caesarstone', 'Silestone', 'Corian', 'KraftMaid',
  'Crystal', 'Fabuwood', 'IKEA', 'Merillat', 'Timberlake',
];

function extractBrand(productName: string): string {
  for (const brand of KNOWN_BRANDS) {
    if (productName.toLowerCase().startsWith(brand.toLowerCase())) {
      return brand;
    }
  }
  // Fallback: first word
  return productName.split(' ')[0];
}

// ─── Main import function ─────────────────────────────────────────────────────

async function importCategory(categorySlug: string): Promise<void> {
  console.log(`\n📦 Importing category: ${categorySlug}`);
  const config = readConfig(categorySlug);

  if (dryRun) {
    console.log(`  [DRY RUN] Would import ${config.calibration_products.length} products`);
    return;
  }

  const categoryId = await upsertCategory(config);
  console.log(`  ✓ Category upserted: ${categorySlug} (${categoryId})`);

  let imported = 0;
  let warnings = 0;

  for (const product of config.calibration_products) {
    // Skip summary file slugs
    if (product.slug.endsWith('_summary')) continue;

    const mdRaw = readInvestigatorReport(categorySlug, product.slug);
    const investigator = mdRaw ? parseInvestigatorReport(mdRaw) : {};

    if (!mdRaw) warnings++;

    const productId = await upsertProduct(categoryId, categorySlug, product, investigator);

    // Upsert specs if present in config
    if (product.specs && Object.keys(product.specs).length > 0) {
      await upsertSpecs(productId, product.specs);
    }

    console.log(
      `  ✓ ${product.name} — Score: ${product.target}, Tier ${product.tier}` +
      (mdRaw ? '' : ' [no investigator report]')
    );
    imported++;
  }

  console.log(`  → Imported ${imported} products (${warnings} without investigator reports)`);
}

async function discoverCategories(): Promise<string[]> {
  const calibrationDir = path.join(PIPELINE_ROOT, 'calibration');
  return fs
    .readdirSync(calibrationDir)
    .filter((name) => {
      const configPath = path.join(calibrationDir, name, 'config.json');
      return fs.existsSync(configPath);
    });
}

// ─── Entry point ──────────────────────────────────────────────────────────────

async function main() {
  console.log('🏠 The Residentialist — Category Importer');
  console.log(`   PIPELINE_ROOT: ${PIPELINE_ROOT}`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);

  try {
    if (importAll) {
      const categories = await discoverCategories();
      console.log(`\nFound ${categories.length} categories: ${categories.join(', ')}`);
      for (const slug of categories) {
        await importCategory(slug);
      }
    } else if (categoryArg) {
      await importCategory(categoryArg);
    }

    console.log('\n✅ Import complete.');
  } catch (err) {
    console.error('\n❌ Import failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
