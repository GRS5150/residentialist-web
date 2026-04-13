import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getProductsByCategory, getAllCategorySlugs } from '@/lib/queries';
import ProductCard from '@/components/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';

interface Props {
  params: Promise<{ categorySlug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  return slugs.map((s) => ({ categorySlug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return {};

  return {
    title: `Best ${category.name} ${new Date().getFullYear()} — Independent Ratings`,
    description: `Independent scores and ratings for ${category.product_count} ${category.name} products. Evaluated on quality, durability, and performance by The Residentialist.`,
    openGraph: {
      title: `Best ${category.name} — Independent Ratings | The Residentialist`,
      url: `https://theresidentialist.com/products/${category.slug}`,
    },
    alternates: {
      canonical: `https://theresidentialist.com/products/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { categorySlug } = await params;
  const [category, products] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getProductsByCategory(categorySlug),
  ]);

  if (!category) notFound();

  const subTypes = [...new Set(products.map((p) => p.sub_type).filter(Boolean))];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          { label: category.name },
        ]}
      />

      {/* Category header */}
      <div className="mt-6 mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {products.length} products scored
        </p>

        {/* Axis weights */}
        <div className="flex gap-4 mt-4">
          {[
            ['Quality', category.axis_weight_quality],
            ['Durability', category.axis_weight_durability],
            ['Performance', category.axis_weight_performance],
          ].map(([label, weight]) => (
            <div key={label as string} className="text-center">
              <p className="text-sm font-semibold text-gray-900">
                {Math.round((weight as number) * 100)}%
              </p>
              <p className="text-xs text-gray-400">{label as string}</p>
            </div>
          ))}
        </div>

        {category.description && (
          <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-2xl">
            {category.description}
          </p>
        )}
      </div>

      {/* BreadcrumbList schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://theresidentialist.com' },
              { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://theresidentialist.com/products' },
              { '@type': 'ListItem', position: 3, name: category.name, item: `https://theresidentialist.com/products/${category.slug}` },
            ],
          }),
        }}
      />

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            categorySlug={categorySlug}
          />
        ))}
      </div>

      {/* Methodology link */}
      <div className="mt-10 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Products in this category are evaluated on quality ({Math.round((category.axis_weight_quality ?? 0) * 100)}%),
          durability ({Math.round((category.axis_weight_durability ?? 0) * 100)}%), and
          performance ({Math.round((category.axis_weight_performance ?? 0) * 100)}%).{' '}
          <Link href="/methodology" className="text-blue-600 hover:text-blue-800 font-medium">
            Learn how scoring works →
          </Link>
        </p>
      </div>
    </div>
  );
}
