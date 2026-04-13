import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllCategories } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Independent Residential Product Intelligence | The Residentialist',
  description:
    'The Residentialist scores residential building products on quality, durability, and performance using a deterministic, evidence-based methodology. No manufacturer funds or influences any rating.',
};

export default async function HomePage() {
  const categories = await getAllCategories();

  return (
    <div>
      {/* Hero */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              Independent product intelligence for residential building.
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              Every product on this site has been independently scored on quality, durability, and
              performance. No manufacturer pays for or influences any rating. The score is the story.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Browse all categories
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link
                href="/methodology"
                className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 px-5 py-2.5 transition-colors"
              >
                How scoring works →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold tabular-nums">{categories.length}</p>
              <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wider">Categories</p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {categories.reduce((sum, c) => sum + c.product_count, 0)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wider">Scored Products</p>
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wider">Paid Placements</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Product Categories</h2>
          <Link href="/products" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products/${category.slug}`}
              className="group border border-gray-200 rounded-lg p-5 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                  {category.name}
                </h3>
                <span className="text-xs text-gray-400 font-medium ml-2 mt-0.5 flex-shrink-0">
                  {category.product_count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Methodology teaser */}
      <section className="border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">How scoring works</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Every product is evaluated across three axes — Quality, Durability, and Performance —
              using a deterministic, evidence-based methodology. Field evidence requires three or more
              independent sources. Scores never change based on manufacturer feedback.
            </p>
            <Link
              href="/methodology"
              className="inline-block mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Read the full methodology →
            </Link>
          </div>
        </div>
      </section>

      {/* Organization schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'The Residentialist',
            url: 'https://theresidentialist.com',
            description:
              'Independent product intelligence platform for residential building products',
          }),
        }}
      />
    </div>
  );
}
