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
