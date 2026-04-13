import Link from 'next/link';
import type { Product } from '@/lib/types';
import ScoreDisplay from './ScoreDisplay';
import TierBadge from './TierBadge';
import AwardBadge from './AwardBadge';

interface ProductCardProps {
  product: Product;
  categorySlug: string;
}

export default function ProductCard({ product, categorySlug }: ProductCardProps) {
  return (
    <Link
      href={`/products/${categorySlug}/${product.slug}`}
      className="group block border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Name and badges */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
            {product.brand}
          </p>
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
            {product.name}
          </h3>
          {product.sub_type && (
            <p className="text-xs text-gray-500 mt-0.5">{product.sub_type}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <TierBadge tier={product.tier} size="sm" />
            {product.award && <AwardBadge award={product.award} size="sm" />}
          </div>
        </div>

        {/* Right: Score */}
        <div className="flex-shrink-0">
          <ScoreDisplay score={product.composite_score} size="sm" />
        </div>
      </div>
    </Link>
  );
}
