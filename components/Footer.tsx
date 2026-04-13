import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">The Residentialist</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Independent product intelligence for residential building products. No manufacturer
              funds or influences any rating.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Products
            </p>
            <ul className="space-y-1.5">
              <li><Link href="/products" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">All Categories</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Company
            </p>
            <ul className="space-y-1.5">
              <li><Link href="/methodology" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Methodology</Link></li>
              <li><Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">About</Link></li>
              <li><Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            © {year} The Residentialist. Scores are derived from a proprietary methodology that
            synthesizes publicly available expert analysis, verified manufacturer specifications, and
            corroborated field performance data.
          </p>
        </div>
      </div>
    </footer>
  );
}
