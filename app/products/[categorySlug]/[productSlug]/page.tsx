import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getProductBySlug,
  getRelatedProducts,
  getAllProductSlugs,
} from '@/lib/queries';
import ScoreDisplay from '@/components/ScoreDisplay';
import AxisBreakdown from '@/components/AxisBreakdown';
import TierBadge from '@/components/TierBadge';
import AwardBadge from '@/components/AwardBadge';
import SpecTable from '@/components/SpecTable';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductCard from '@/components/ProductCard';

interface Props {
  params: Promise<{ categorySlug: string; productSlug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((s) => ({
    categorySlug: s.category_slug,
    productSlug: s.product_slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug, productSlug } = await params;
  const product = await getProductBySlug(categorySlug, productSlug);
  if (!product) return {};

  const description = `${product.name} scored ${product.composite_score}/100 (${product.tier_label}). Independent evaluation of quality, durability, and performance. ${product.summary?.slice(0, 120) ?? ''}`;

  return {
    title: `${product.name} Review & Score`,
    description,
    openGraph: {
      title: `${product.name} — Scored ${product.composite_score}/100 | The Residentialist`,
      description: product.summary?.slice(0, 160) ?? description,
      type: 'article',
      url: `https://theresidentialist.com/products/${categorySlug}/${productSlug}`,
    },
    alternates: {
      canonical: `https://theresidentialist.com/products/${categorySlug}/${productSlug}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { categorySlug, productSlug } = await params;
  const product = await getProductBySlug(categorySlug, productSlug);
  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product.category_id, product.id);
  const category = product.category;

  const keySpecs = product.specs.filter((s) => s.is_key_spec);
  const otherSpecs = product.specs.filter((s) => !s.is_key_spec);

  // JSON-LD structured data
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    category: category.name,
    review: {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(product.composite_score),
        bestRating: '100',
        worstRating: '0',
      },
      author: {
        '@type': 'Organization',
        name: 'The Residentialist',
      },
      reviewBody: product.summary?.slice(0, 300) ?? '',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://theresidentialist.com' },
      { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://theresidentialist.com/products' },
      { '@type': 'ListItem', position: 3, name: category.name, item: `https://theresidentialist.com/products/${categorySlug}` },
      { '@type': 'ListItem', position: 4, name: product.name, item: `https://theresidentialist.com/products/${categorySlug}/${productSlug}` },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* 1. Breadcrumb */}
      <Breadcrumbs
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          { label: category.name, href: `/products/${categorySlug}` },
          { label: product.name },
        ]}
      />

      {/* 2. Product header */}
      <div className="mt-6 pb-6 border-b border-gray-200">
        <div className="flex items-start gap-6">
          {/* Score ring — left col on desktop */}
          <div className="flex-shrink-0 hidden sm:block">
            <ScoreDisplay score={product.composite_score} size="lg" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              {product.brand}
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>
            {product.sub_type && (
              <p className="mt-1 text-sm text-gray-500">{product.sub_type}</p>
            )}

            {/* Mobile score */}
            <div className="flex items-center gap-4 mt-4 sm:hidden">
              <ScoreDisplay score={product.composite_score} size="md" />
              <div>
                <TierBadge tier={product.tier} />
                {product.award && <div className="mt-1.5"><AwardBadge award={product.award} /></div>}
              </div>
            </div>

            <div className="hidden sm:flex flex-wrap gap-2 mt-3">
              <TierBadge tier={product.tier} />
              {product.award && <AwardBadge award={product.award} />}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content column */}
        <div className="lg:col-span-2 space-y-8">

          {/* 3. Score breakdown */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Score Breakdown</h2>
            <AxisBreakdown
              qualityScore={product.quality_score}
              durabilityScore={product.durability_score}
              performanceScore={product.performance_score}
              weightQuality={category.axis_weight_quality ?? 0.33}
              weightDurability={category.axis_weight_durability ?? 0.33}
              weightPerformance={category.axis_weight_performance ?? 0.34}
            />
          </section>

          {/* 4. Summary */}
          {product.summary && (
            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-3">What You Should Know</h2>
              <div className="prose prose-sm prose-gray max-w-none">
                {product.summary.split('\n\n').map((para, i) => (
                  <p key={i} className="text-sm text-gray-700 leading-relaxed mb-3">
                    {para}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* 5. Strengths & Deficiencies */}
          {((product.strengths?.length ?? 0) > 0 || (product.deficiencies?.length ?? 0) > 0) && (
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(product.strengths?.length ?? 0) > 0 && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                  <h2 className="text-sm font-semibold text-green-800 mb-3">Strengths</h2>
                  <ul className="space-y-2">
                    {product.strengths!.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-green-900">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 mt-0.5 text-green-600">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(product.deficiencies?.length ?? 0) > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                  <h2 className="text-sm font-semibold text-amber-800 mb-3">Deficiencies</h2>
                  <ul className="space-y-2">
                    {product.deficiencies!.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 mt-0.5 text-amber-600">
                          <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                        </svg>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* 6. Key Specifications */}
          {product.specs.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-4">Specifications</h2>
              <SpecTable specs={product.specs} />
            </section>
          )}

          {/* 7. Warranty summary */}
          {product.warranty_summary && (
            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-3">Warranty & Repair</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{product.warranty_summary}</p>
            </section>
          )}

          {/* 8. Company background */}
          {product.company_background && (
            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-3">Company Background</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{product.company_background}</p>
            </section>
          )}

          {/* 9. Platform disclosure */}
          {product.platform_disclosure && (
            <section className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-blue-900 mb-2">Platform Disclosure</h2>
              <p className="text-sm text-blue-800 leading-relaxed">{product.platform_disclosure}</p>
            </section>
          )}

          {/* 10. Corporate outlook */}
          {product.outlook && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-base font-semibold text-gray-900">Corporate Outlook</h2>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    product.outlook === 'Strong'
                      ? 'bg-green-100 text-green-800'
                      : product.outlook === 'Stable'
                      ? 'bg-blue-100 text-blue-800'
                      : product.outlook === 'Conditional'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {product.outlook}
                </span>
                <span className="text-xs text-gray-400">— Report Only, does not affect score</span>
              </div>
              {product.outlook_rationale && (
                <p className="text-sm text-gray-600 leading-relaxed">{product.outlook_rationale}</p>
              )}
            </section>
          )}

          {/* 11. Material safety */}
          {product.material_safety && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-base font-semibold text-gray-900">Material Safety</h2>
                <span className="text-xs text-gray-400">— Report Only, does not affect score</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{product.material_safety}</p>
            </section>
          )}

          {/* 12. Purchase link */}
          {(product.affiliate_url || product.manufacturer_url) && (
            <section className="border border-gray-200 rounded-lg p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Where to Buy</h2>
              <div className="flex flex-wrap gap-3">
                {product.affiliate_url && (
                  <a
                    href={product.affiliate_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Buy at {product.affiliate_retailer ?? 'Retailer'}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                  </a>
                )}
                {product.manufacturer_url && (
                  <a
                    href={product.manufacturer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg hover:border-gray-400 transition-colors"
                  >
                    Manufacturer site →
                  </a>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar — desktop right column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Score card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
              Residentialist Score
            </p>
            <ScoreDisplay score={product.composite_score} size="lg" />
            <div className="mt-4 space-y-2">
              <TierBadge tier={product.tier} />
              {product.award && <div><AwardBadge award={product.award} /></div>}
            </div>
          </div>

          {/* Quick specs */}
          {keySpecs.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Key Specifications
              </h3>
              <dl className="divide-y divide-gray-100">
                {keySpecs.map((spec) => (
                  <div key={spec.id} className="flex flex-col py-2">
                    <dt className="text-xs text-gray-400">{spec.spec_name}</dt>
                    <dd className="text-xs font-semibold text-gray-900 mt-0.5">{spec.spec_value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* 13. Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Other {category.name} Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedProducts.map((related) => (
              <ProductCard
                key={related.id}
                product={related}
                categorySlug={categorySlug}
              />
            ))}
          </div>
        </section>
      )}

      {/* 14. Directory placeholder (Phase 2) */}
      {/*
        PHASE 2 PLACEHOLDER — DO NOT REMOVE
        When Phase 2 ships, this section will show up to 3 installers and 3 dealers
        geo-targeted by visitor location.

        Replace this comment with the directory component when ready.
        <DirectorySection productName={product.name} categorySlug={categorySlug} />
      */}
    </div>
  );
}
