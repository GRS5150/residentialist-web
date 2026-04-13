'use client';

import { useState } from 'react';
import type { ProductSpec } from '@/lib/types';

interface SpecTableProps {
  specs: ProductSpec[];
}

export default function SpecTable({ specs }: SpecTableProps) {
  const [showAll, setShowAll] = useState(false);

  const keySpecs = specs.filter((s) => s.is_key_spec);
  const otherSpecs = specs.filter((s) => !s.is_key_spec);

  if (specs.length === 0) return null;

  return (
    <div>
      {/* Key specs — always visible */}
      {keySpecs.length > 0 && (
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
          {keySpecs.map((spec) => (
            <div key={spec.id} className="flex items-baseline justify-between px-4 py-3 bg-white">
              <dt className="text-sm text-gray-500 font-medium">{spec.spec_name}</dt>
              <dd className="text-sm text-gray-900 font-semibold ml-4 text-right">
                {spec.spec_value}
                {spec.spec_unit && (
                  <span className="text-gray-400 font-normal ml-1">{spec.spec_unit}</span>
                )}
              </dd>
            </div>
          ))}
        </div>
      )}

      {/* All specs — expandable */}
      {otherSpecs.length > 0 && (
        <div className="mt-3">
          {showAll && (
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden mb-3">
              {otherSpecs.map((spec) => (
                <div key={spec.id} className="flex items-baseline justify-between px-4 py-3 bg-gray-50">
                  <dt className="text-sm text-gray-500">{spec.spec_name}</dt>
                  <dd className="text-sm text-gray-700 ml-4 text-right">
                    {spec.spec_value}
                    {spec.spec_unit && (
                      <span className="text-gray-400 ml-1">{spec.spec_unit}</span>
                    )}
                  </dd>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
          >
            {showAll ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 15-6-6-6 6"/></svg>
                Hide additional specifications
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                View all {otherSpecs.length} additional specifications
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
