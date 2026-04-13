import { query, queryOne } from './db';
import type { Category, Product, ProductSpec, ProductWithCategory, ProductWithSpecs } from './types';

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getAllCategories(): Promise<Category[]> {
  return query<Category>(`
    SELECT * FROM categories
    WHERE status = 'active'
    ORDER BY display_order ASC NULLS LAST, name ASC
  `);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return queryOne<Category>(
    `SELECT * FROM categories WHERE slug = $1 AND status = 'active'`,
    [slug]
  );
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getAllProducts(): Promise<ProductWithCategory[]> {
  return query<ProductWithCategory>(`
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'active' AND c.status = 'active'
    ORDER BY p.composite_score DESC
  `);
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  return query<Product>(`
    SELECT p.*
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE c.slug = $1 AND p.status = 'active' AND c.status = 'active'
    ORDER BY p.composite_score DESC
  `, [categorySlug]);
}

export async function getProductBySlug(
  categorySlug: string,
  productSlug: string
): Promise<ProductWithSpecs | null> {
  const product = await queryOne<Product>(`
    SELECT p.*
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE c.slug = $1 AND p.slug = $2 AND p.status = 'active'
  `, [categorySlug, productSlug]);

  if (!product) return null;

  const [specs, category] = await Promise.all([
    getSpecsByProduct(product.id),
    queryOne<import('./types').Category>(
      `SELECT * FROM categories WHERE id = $1`,
      [product.category_id]
    ),
  ]);

  return { ...product, specs, category: category! };
}

export async function getRelatedProducts(
  categoryId: string,
  excludeProductId: string
): Promise<Product[]> {
  return query<Product>(`
    SELECT * FROM products
    WHERE category_id = $1 AND id != $2 AND status = 'active'
    ORDER BY composite_score DESC
    LIMIT 6
  `, [categoryId, excludeProductId]);
}

// ─── Specs ────────────────────────────────────────────────────────────────────

export async function getSpecsByProduct(productId: string): Promise<ProductSpec[]> {
  return query<ProductSpec>(`
    SELECT * FROM product_specs
    WHERE product_id = $1
    ORDER BY display_order ASC
  `, [productId]);
}

// ─── Sitemap helpers ──────────────────────────────────────────────────────────

export async function getAllProductSlugs(): Promise<
  Array<{ category_slug: string; product_slug: string; updated_at: string }>
> {
  return query(`
    SELECT c.slug AS category_slug, p.slug AS product_slug, p.updated_at
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'active' AND c.status = 'active'
  `);
}

export async function getAllCategorySlugs(): Promise<
  Array<{ slug: string; updated_at: string }>
> {
  return query(`
    SELECT slug, updated_at FROM categories
    WHERE status = 'active'
    ORDER BY display_order ASC
  `);
}
