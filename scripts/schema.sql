-- ============================================================
-- THE RESIDENTIALIST — Full PostgreSQL Schema
-- All Phase 1, 2, and 3 tables
-- Run against: Supabase / Railway / Neon PostgreSQL instance
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── PHASE 1: Core tables ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  slug                  TEXT UNIQUE NOT NULL,
  description           TEXT,
  axis_weight_quality   DECIMAL(3,2),
  axis_weight_durability DECIMAL(3,2),
  axis_weight_performance DECIMAL(3,2),
  pool_s_source         TEXT,
  product_count         INTEGER DEFAULT 0,
  status                TEXT DEFAULT 'active' CHECK (status IN ('active','draft','archived')),
  display_order         INTEGER,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id           UUID REFERENCES categories(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  brand                 TEXT NOT NULL,
  slug                  TEXT UNIQUE NOT NULL,
  sub_type              TEXT,
  composite_score       INTEGER NOT NULL CHECK (composite_score >= 0 AND composite_score <= 100),
  tier                  INTEGER NOT NULL CHECK (tier >= 1 AND tier <= 5),
  tier_label            TEXT NOT NULL,
  quality_score         DECIMAL(4,1),
  durability_score      DECIMAL(4,1),
  performance_score     DECIMAL(4,1),
  award                 TEXT CHECK (award IN ('recommended','generational') OR award IS NULL),
  summary               TEXT NOT NULL,
  company_background    TEXT,
  strengths             TEXT[],
  deficiencies          TEXT[],
  outlook               TEXT CHECK (outlook IN ('Strong','Stable','Conditional','Negative') OR outlook IS NULL),
  outlook_rationale     TEXT,
  platform_disclosure   TEXT,
  warranty_summary      TEXT,
  material_safety       TEXT,
  price_tier            TEXT CHECK (price_tier IN ('mid_range','premium','high_ticket') OR price_tier IS NULL),
  affiliate_url         TEXT,
  affiliate_retailer    TEXT,
  manufacturer_url      TEXT,
  status                TEXT DEFAULT 'active' CHECK (status IN ('active','draft','archived')),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_specs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID REFERENCES products(id) ON DELETE CASCADE,
  spec_name     TEXT NOT NULL,
  spec_value    TEXT NOT NULL,
  spec_unit     TEXT,
  display_order INTEGER DEFAULT 0,
  is_key_spec   BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS scoring_rules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_number   INTEGER UNIQUE NOT NULL,
  rule_text     TEXT NOT NULL,
  applies_to    TEXT DEFAULT 'all'
);

-- ─── PHASE 2: Directory tables ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS metros (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  state       TEXT NOT NULL,
  population  INTEGER,
  tier        TEXT CHECK (tier IN ('large','mid','small') OR tier IS NULL),
  latitude    DECIMAL(9,6),
  longitude   DECIMAL(9,6),
  status      TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS installers (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name           TEXT NOT NULL,
  slug                    TEXT UNIQUE NOT NULL,
  contact_email           TEXT,
  contact_phone           TEXT,
  website_url             TEXT,
  google_business_url     TEXT,
  google_rating           DECIMAL(2,1),
  google_review_count     INTEGER,
  license_number          TEXT,
  license_state           TEXT,
  insurance_verified      BOOLEAN DEFAULT false,
  is_founding_member      BOOLEAN DEFAULT false,
  membership_status       TEXT DEFAULT 'free' CHECK (membership_status IN ('free','active','expired','waitlisted')),
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  annual_fee_cents        INTEGER,
  membership_start        DATE,
  membership_end          DATE,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS installer_brands (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installer_id  UUID REFERENCES installers(id) ON DELETE CASCADE,
  brand         TEXT NOT NULL,
  category_id   UUID REFERENCES categories(id),
  self_attested BOOLEAN DEFAULT true,
  verified      BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS installer_metros (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installer_id  UUID REFERENCES installers(id) ON DELETE CASCADE,
  metro_id      UUID REFERENCES metros(id) ON DELETE CASCADE,
  UNIQUE(installer_id, metro_id)
);

CREATE TABLE IF NOT EXISTS dealers (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name           TEXT NOT NULL,
  slug                    TEXT UNIQUE NOT NULL,
  showroom_address        TEXT,
  contact_email           TEXT,
  contact_phone           TEXT,
  website_url             TEXT,
  google_rating           DECIMAL(2,1),
  google_review_count     INTEGER,
  is_founding_member      BOOLEAN DEFAULT false,
  membership_status       TEXT DEFAULT 'free',
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  annual_fee_cents        INTEGER,
  membership_start        DATE,
  membership_end          DATE,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dealer_brands (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id     UUID REFERENCES dealers(id) ON DELETE CASCADE,
  brand         TEXT NOT NULL,
  category_id   UUID REFERENCES categories(id),
  is_authorized BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS dealer_metros (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id   UUID REFERENCES dealers(id) ON DELETE CASCADE,
  metro_id    UUID REFERENCES metros(id) ON DELETE CASCADE,
  UNIQUE(dealer_id, metro_id)
);

-- ─── PHASE 2: Quote request tables ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quote_requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          UUID REFERENCES products(id),
  metro_id            UUID REFERENCES metros(id),
  consumer_name       TEXT,
  consumer_email      TEXT,
  consumer_phone      TEXT,
  project_description TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  status              TEXT DEFAULT 'new' CHECK (status IN ('new','routed','responded','closed'))
);

CREATE TABLE IF NOT EXISTS quote_request_routing (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID REFERENCES quote_requests(id) ON DELETE CASCADE,
  installer_id     UUID REFERENCES installers(id) ON DELETE CASCADE,
  routed_at        TIMESTAMPTZ DEFAULT NOW(),
  responded        BOOLEAN DEFAULT false,
  responded_at     TIMESTAMPTZ
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_products_category        ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug            ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_brand           ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_composite_score ON products(composite_score DESC);
CREATE INDEX IF NOT EXISTS idx_products_tier            ON products(tier);
CREATE INDEX IF NOT EXISTS idx_products_award           ON products(award) WHERE award IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_product_specs_product    ON product_specs(product_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug          ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_installer_brands_brand   ON installer_brands(brand);
CREATE INDEX IF NOT EXISTS idx_installer_metros_metro   ON installer_metros(metro_id);
CREATE INDEX IF NOT EXISTS idx_dealer_brands_brand      ON dealer_brands(brand);
CREATE INDEX IF NOT EXISTS idx_dealer_metros_metro      ON dealer_metros(metro_id);

-- ─── Auto-update product_count trigger ───────────────────────────────────────

CREATE OR REPLACE FUNCTION update_category_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE categories
    SET product_count = (
      SELECT COUNT(*) FROM products
      WHERE category_id = NEW.category_id AND status = 'active'
    ),
    updated_at = NOW()
    WHERE id = NEW.category_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    UPDATE categories
    SET product_count = (
      SELECT COUNT(*) FROM products
      WHERE category_id = OLD.category_id AND status = 'active'
    ),
    updated_at = NOW()
    WHERE id = OLD.category_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_product_count ON products;
CREATE TRIGGER trg_update_product_count
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION update_category_product_count();
