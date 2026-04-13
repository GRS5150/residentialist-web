interface AxisBreakdownProps {
  qualityScore: number | string | null;
  durabilityScore: number | string | null;
  performanceScore: number | string | null;
  weightQuality: number | string;
  weightDurability: number | string;
  weightPerformance: number | string;
}

const AXIS_CONFIG = {
  quality: {
    label: 'Quality',
    description: 'Construction, materials, certifications',
    color: '#1B3A6B',
  },
  durability: {
    label: 'Durability',
    description: 'Longevity, warranty, serviceability',
    color: '#2563EB',
  },
  performance: {
    label: 'Performance',
    description: 'Functional specs, measurable output',
    color: '#16A34A',
  },
};

function AxisBar({
  label,
  description,
  score,
  weight,
  color,
}: {
  label: string;
  description: string;
  score: number | string | null;
  weight: number | string;
  color: string;
}) {
  // pg returns DECIMAL columns as strings — coerce to number
  const displayScore = score !== null && score !== undefined ? Number(score) : 0;
  const weightNum = Number(weight);
  const weightPct = Math.round(weightNum * 100);

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-sm font-semibold text-gray-800">{label}</span>
          <span className="ml-2 text-xs text-gray-400">{weightPct}% weight</span>
        </div>
        <span
          className="text-lg font-bold tabular-nums"
          style={{ color, fontFamily: 'ui-monospace, monospace' }}
        >
          {score !== null && score !== undefined ? displayScore.toFixed(0) : '—'}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${displayScore}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
}

export default function AxisBreakdown({
  qualityScore,
  durabilityScore,
  performanceScore,
  weightQuality,
  weightDurability,
  weightPerformance,
}: AxisBreakdownProps) {
  return (
    <div className="space-y-5">
      <AxisBar
        {...AXIS_CONFIG.quality}
        score={qualityScore}
        weight={weightQuality}
      />
      <AxisBar
        {...AXIS_CONFIG.durability}
        score={durabilityScore}
        weight={weightDurability}
      />
      <AxisBar
        {...AXIS_CONFIG.performance}
        score={performanceScore}
        weight={weightPerformance}
      />
    </div>
  );
}
