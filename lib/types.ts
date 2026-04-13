// ─── Core types matching the full database schema ───────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  axis_weight_quality: number;
  axis_weight_durability: number;
  axis_weight_performance: number;
  pool_s_source: string | null;
  product_count: number;
  status: string;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  brand: string;
  slug: string;
  sub_type: string | null;
  composite_score: number;
  tier: number;
  tier_label: string;
  quality_score: number | null;
  durability_score: number | null;
  performance_score: number | null;
  award: 'recommended' | 'generational' | null;
  summary: string;
  company_background: string | null;
  strengths: string[];
  deficiencies: string[];
  outlook: string | null;
  outlook_rationale: string | null;
  platform_disclosure: string | null;
  warranty_summary: string | null;
  material_safety: string | null;
  price_tier: string | null;
  affiliate_url: string | null;
  affiliate_retailer: string | null;
  manufacturer_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProductSpec {
  id: string;
  product_id: string;
  spec_name: string;
  spec_value: string;
  spec_unit: string | null;
  display_order: number;
  is_key_spec: boolean;
}

export interface ScoringRule {
  id: string;
  rule_number: number;
  rule_text: string;
  applies_to: string;
}

// ─── Join / enriched types ────────────────────────────────────────────────────

export interface ProductWithCategory extends Product {
  category_name: string;
  category_slug: string;
}

export interface ProductWithSpecs extends Product {
  specs: ProductSpec[];
  category: Category;
}

export interface CategoryWithProducts extends Category {
  products: Product[];
}

// ─── Phase 2 types (schema exists, UI not yet built) ─────────────────────────

export interface Metro {
  id: string;
  name: string;
  slug: string;
  state: string;
  population: number | null;
  tier: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
}

export interface Installer {
  id: string;
  business_name: string;
  slug: string;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  google_business_url: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  license_number: string | null;
  license_state: string | null;
  insurance_verified: boolean;
  is_founding_member: boolean;
  membership_status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  annual_fee_cents: number | null;
  membership_start: string | null;
  membership_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Dealer {
  id: string;
  business_name: string;
  slug: string;
  showroom_address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  is_founding_member: boolean;
  membership_status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  annual_fee_cents: number | null;
  membership_start: string | null;
  membership_end: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Sub-type display name mapping ──────────────────────────────────────────
// Maps raw database sub_type values to human-readable display strings.
// Add entries here as new categories with sub-types are imported.

export const SUB_TYPE_DISPLAY_NAMES: Record<string, string> = {
  // Sinks
  kitchen_stainless: 'Kitchen — Stainless Steel',
  kitchen_cast_iron: 'Kitchen — Cast Iron',
  kitchen_fireclay: 'Kitchen — Fireclay',
  kitchen_composite: 'Kitchen — Composite',
  bathroom_vitreous_china: 'Bathroom — Vitreous China',
  bathroom_ceramic: 'Bathroom — Ceramic',
  bathroom_cast_iron: 'Bathroom — Cast Iron',
  bathroom_fireclay: 'Bathroom — Fireclay',
  laundry_utility: 'Laundry / Utility',
  bar_prep: 'Bar / Prep',
  // Tile
  tile_porcelain: 'Porcelain Tile',
  tile_ceramic: 'Ceramic Tile',
  tile_natural_stone: 'Natural Stone',
  tile_glass: 'Glass Tile',
  tile_cement: 'Cement Tile',
  floor_tile: 'Floor Tile',
  wall_tile: 'Wall Tile',
  floor_and_wall: 'Floor & Wall Tile',
  // Toilets
  toilet_one_piece: 'One-Piece',
  toilet_two_piece: 'Two-Piece',
  toilet_wall_hung: 'Wall-Hung',
  toilet_smart: 'Smart / Bidet',
  // Faucets
  kitchen_faucet: 'Kitchen Faucet',
  bathroom_faucet: 'Bathroom Faucet',
  shower_faucet: 'Shower / Tub Faucet',
  bar_faucet: 'Bar / Prep Faucet',
  utility_faucet: 'Utility Faucet',
  // Cabinets
  cabinets_base: 'Base Cabinets',
  cabinets_wall: 'Wall Cabinets',
  cabinets_full_kitchen: 'Full Kitchen System',
  cabinets_bathroom_vanity: 'Bathroom Vanity',
  // Countertops
  countertop_quartz: 'Quartz',
  countertop_granite: 'Granite',
  countertop_quartzite: 'Quartzite',
  countertop_marble: 'Marble',
  countertop_dekton: 'Dekton / Ultra-Compact',
  countertop_laminate: 'Laminate',
  countertop_solid_surface: 'Solid Surface',
  countertop_butcher_block: 'Butcher Block',
  countertop_concrete: 'Concrete',
  // Hardwood flooring
  hardwood_solid: 'Solid Hardwood',
  hardwood_engineered: 'Engineered Hardwood',
  hardwood_prefinished: 'Prefinished Hardwood',
  hardwood_site_finished: 'Site-Finished Hardwood',
  // Windows
  window_double_hung: 'Double-Hung Window',
  window_casement: 'Casement Window',
  window_sliding: 'Sliding Window',
  window_awning: 'Awning Window',
  window_picture: 'Picture Window',
  window_bay_bow: 'Bay / Bow Window',
  window_skylight: 'Skylight',
  // Exterior doors
  door_entry: 'Entry Door',
  door_patio: 'Patio Door',
  door_sliding_glass: 'Sliding Glass Door',
  door_french: 'French Door',
  door_storm: 'Storm Door',
  // HVAC
  hvac_central_air: 'Central Air System',
  hvac_heat_pump: 'Heat Pump',
  hvac_mini_split: 'Mini-Split',
  hvac_furnace: 'Furnace',
  hvac_boiler: 'Boiler',
  hvac_air_handler: 'Air Handler',
  // Refrigerators
  refrigerator_french_door: 'French Door Refrigerator',
  refrigerator_side_by_side: 'Side-by-Side Refrigerator',
  refrigerator_bottom_freezer: 'Bottom-Freezer Refrigerator',
  refrigerator_top_freezer: 'Top-Freezer Refrigerator',
  refrigerator_column: 'Column Refrigerator',
  refrigerator_counter_depth: 'Counter-Depth Refrigerator',
  // Water heaters
  water_heater_tank_gas: 'Tank — Gas',
  water_heater_tank_electric: 'Tank — Electric',
  water_heater_tankless_gas: 'Tankless — Gas',
  water_heater_tankless_electric: 'Tankless — Electric',
  water_heater_heat_pump: 'Heat Pump Water Heater',
  // Lighting control
  lighting_dimmer: 'Smart Dimmer',
  lighting_switch: 'Smart Switch',
  lighting_system: 'Full Lighting System',
  // Motorized shades
  shades_roller: 'Roller Shades',
  shades_cellular: 'Cellular Shades',
  shades_roman: 'Roman Shades',
  shades_venetian: 'Venetian / Horizontal Blinds',
  shades_panel: 'Panel Track Shades',
};

/**
 * Converts a raw sub_type database value to a human-readable display string.
 * Falls back to title-casing the raw value if no mapping exists.
 */
export function formatSubType(subType: string | null): string | null {
  if (!subType) return null;
  return SUB_TYPE_DISPLAY_NAMES[subType] ??
    subType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Tier definitions ─────────────────────────────────────────────────────────

export const TIER_LABELS: Record<number, string> = {
  1: 'Best in Class',
  2: 'Excellent',
  3: 'Good',
  4: 'Fair',
  5: 'Below Standard',
};

export const TIER_RANGES: Record<number, { min: number; max: number }> = {
  1: { min: 90, max: 100 },
  2: { min: 75, max: 89 },
  3: { min: 60, max: 74 },
  4: { min: 40, max: 59 },
  5: { min: 0, max: 39 },
};

export function getTierFromScore(score: number): number {
  for (const [tier, range] of Object.entries(TIER_RANGES)) {
    if (score >= range.min && score <= range.max) return Number(tier);
  }
  return 5;
}
