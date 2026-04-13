import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().getFullYear()}</p>
      <div className="prose prose-gray prose-sm max-w-none space-y-4">
        <p className="text-gray-700 leading-relaxed">
          The Residentialist does not collect personal information from visitors. We do not use
          login walls, email captures, or user tracking beyond standard web analytics (Google
          Analytics). We do not sell data to third parties.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Affiliate links on product pages may track purchases. We disclose affiliate relationships
          on all relevant pages.
        </p>
        <p className="text-gray-700 leading-relaxed">
          This policy will be updated as the site adds features. Questions: contact@theresidentialist.com
        </p>
      </div>
    </div>
  );
}
