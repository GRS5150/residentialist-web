import Link from 'next/link';
import type { Category } from '@/lib/types';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/products/${category.slug}`}
      className="group block border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
          {category.name}
        </h3>
        <span className="flex-shrink-0 text-xs text-gray-400 font-medium mt-0.5">
          {category.product_count} products
        </span>
      </div>
      {category.description && (
        <p className="mt-2 text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {category.description}
        </p>
      )}
      <div className="mt-4 flex gap-3 text-xs text-gray-400">
        <span>Q {Math.round((category.axis_weight_quality ?? 0) * 100)}%</span>
        <span>D {Math.round((category.axis_weight_durability ?? 0) * 100)}%</span>
        <span>P {Math.round((category.axis_weight_performance ?? 0) * 100)}%</span>
      </div>
    </Link>
  );
}
