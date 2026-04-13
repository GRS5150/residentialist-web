import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().getFullYear()}</p>
      <div className="prose prose-gray prose-sm max-w-none space-y-4">
        <p className="text-gray-700 leading-relaxed">
          By using The Residentialist, you agree that scores and evaluations are provided for
          informational purposes only and do not constitute professional advice. Product scores
          may change as new evidence becomes available.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Content on this site is protected by copyright. You may cite and link to our scores
          freely. You may not reproduce our full product reports without attribution.
        </p>
        <p className="text-gray-700 leading-relaxed">
          The Residentialist makes no warranties about the accuracy, completeness, or timeliness
          of any information on this site. Use of affiliate links does not affect product scores.
        </p>
      </div>
    </div>
  );
}
