import Link from 'next/link';

export default function Navigation() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-base font-bold text-gray-900 tracking-tight">
            The Residentialist
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/products"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            All Products
          </Link>
          <Link
            href="/methodology"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            Methodology
          </Link>
          <Link
            href="/about"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
