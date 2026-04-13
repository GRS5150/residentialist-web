import type { Metadata } from 'next';
import { getAllCategories } from '@/lib/queries';
import CategoryCard from '@/components/CategoryCard';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'All Product Categories — Independent Ratings',
  description:
    'Independent scores and ratings for residential building products across all categories. Evaluated on quality, durability, and performance by The Residentialist.',
};

export default async function AllCategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Products' },
        ]}
      />

      <div className="mt-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">All Product Categories</h1>
        <p className="mt-2 text-sm text-gray-500">
          {categories.length} categories —{' '}
          {categories.reduce((sum, c) => sum + c.product_count, 0)} products scored
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
