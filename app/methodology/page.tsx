import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How Scoring Works — Methodology',
  description:
    'The Residentialist uses a deterministic, evidence-based scoring methodology. Same inputs always produce the same score. No manufacturer pays for or influences any rating.',
};

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Methodology</h1>
      <p className="text-sm text-gray-500 mb-10">How scores are derived</p>

      <div className="prose prose-gray prose-sm max-w-none space-y-8">

        <section>
          <h2 className="text-lg font-semibold text-gray-900">How It Works</h2>
          <p className="text-gray-700 leading-relaxed">
            Scores are derived from a proprietary methodology that synthesizes publicly available
            expert analysis, verified manufacturer specifications, and corroborated field performance
            data. No manufacturer funds or influences any rating.
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            The methodology is deterministic — given the same inputs, the same score is always
            produced. There is no editorial discretion in the final number. Scores only change when
            new evidence changes the inputs.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Four-Axis Evaluation</h2>
          <p className="text-gray-700 leading-relaxed">
            Every product is evaluated across four axes:
          </p>
          <ul className="mt-3 space-y-3 text-gray-700">
            <li>
              <strong className="text-gray-900">Quality</strong> — Construction materials,
              manufacturing consistency, certifications, and build standards. Reflects how well the
              product is made, not just how it performs.
            </li>
            <li>
              <strong className="text-gray-900">Durability</strong> — Expected service life, warranty
              terms, parts availability, and field longevity reports from owners and technicians.
            </li>
            <li>
              <strong className="text-gray-900">Performance</strong> — Measurable functional output:
              CFM for range hoods, flush volume for toilets, PEI rating for tile. Category-specific.
            </li>
            <li>
              <strong className="text-gray-900">Material Safety</strong> — A flag-based report, not a
              scored axis. Certifications, known hazards, and chemical disclosures are documented here.
              Material Safety is never folded into the composite score.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Axis Weights</h2>
          <p className="text-gray-700 leading-relaxed">
            Each category has its own weighting across the three scored axes (Quality, Durability,
            Performance). A range hood category weights Performance heavily because airflow is the
            primary functional measure. A faucet category weights Quality and Durability heavily
            because cartridge engineering and finish longevity are the differentiators. Weights are
            set once, before scoring, and do not change.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Tiers</h2>
          <div className="mt-3 divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
            {[
              ['Tier 1', '90–100', 'Best in Class', 'The benchmark for the category.'],
              ['Tier 2', '75–89', 'Excellent', 'Strong performer with minor tradeoffs.'],
              ['Tier 3', '60–74', 'Good', 'Solid mid-tier — meets professional standards.'],
              ['Tier 4', '40–59', 'Fair', 'Functional but meaningful compromises.'],
              ['Tier 5', '0–39', 'Below Standard', 'Below professional minimums.'],
            ].map(([tier, range, label, desc]) => (
              <div key={tier} className="flex items-start gap-4 px-4 py-3 bg-white">
                <div className="w-16 flex-shrink-0 text-xs font-semibold text-gray-500">{tier}</div>
                <div className="w-16 flex-shrink-0 text-xs tabular-nums text-gray-400">{range}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Source Pool Structure</h2>
          <p className="text-gray-700 leading-relaxed">
            Field evidence requires three or more independent sources before a factual claim can
            influence a score. Sources are organized into pools by authority level:
          </p>
          <ul className="mt-3 space-y-2 text-gray-700">
            <li><strong className="text-gray-900">Star sources</strong> — The highest-authority reference for a category. One per category maximum.</li>
            <li><strong className="text-gray-900">Expert sources</strong> — Independent lab testing, professional installer consensus, trade publications, manufacturer technical documentation.</li>
            <li><strong className="text-gray-900">Review sources</strong> — Verified long-term owner reports, professional review publications.</li>
            <li><strong className="text-gray-900">Forum sources</strong> — Field reports from repair technicians and installers in professional communities.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            Source weights within each pool are proprietary and not disclosed publicly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Award Designations</h2>
          <ul className="space-y-3 text-gray-700">
            <li>
              <strong className="text-gray-900">Recommended</strong> — Products demonstrating genuine
              integrity at their price point. Specs match marketing, construction is sound. Multiple
              per category possible.
            </li>
            <li>
              <strong className="text-gray-900">Generational</strong> — Built to outlast the mortgage.
              One, maybe two per category maximum. Some categories have zero. The badge never carries
              the score number — the award and the score are independent.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">What We Do Not Score</h2>
          <ul className="space-y-1 text-gray-700">
            <li>Price or value — we score the product, not the deal</li>
            <li>Aesthetic design or style preferences</li>
            <li>Availability or lead time</li>
            <li>Dealer or retailer experience</li>
            <li>Litigation history (documented in Corporate Outlook, never affects score)</li>
          </ul>
        </section>

      </div>
    </div>
  );
}
