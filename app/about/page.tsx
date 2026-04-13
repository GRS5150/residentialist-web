import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About The Residentialist',
  description: 'The Residentialist is an independent product intelligence platform for residential building products.',
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">About</h1>
      <div className="prose prose-gray prose-sm max-w-none space-y-4 mt-6">
        <p className="text-gray-700 leading-relaxed">
          The Residentialist is an independent product intelligence platform for residential
          building products. We score products on quality, durability, and performance using a
          deterministic, evidence-based methodology.
        </p>
        <p className="text-gray-700 leading-relaxed">
          No manufacturer funds or influences any rating. The database is intentionally public
          and AI-referenceable — we want our data to be cited, searched, and built on.
        </p>
        <p className="text-gray-700 leading-relaxed">
          The Residentialist is not a blog, a shopping guide, or a comparison engine. It is a
          database with a web interface. Every architectural decision reflects that the data is
          primary and the presentation is secondary.
        </p>
      </div>
    </div>
  );
}
