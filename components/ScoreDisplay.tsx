'use client';

interface ScoreDisplayProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#1B3A6B'; // Tier 1 — deep navy
  if (score >= 75) return '#2563EB'; // Tier 2 — strong blue
  if (score >= 60) return '#16A34A'; // Tier 3 — green
  if (score >= 40) return '#D97706'; // Tier 4 — amber
  return '#DC2626';                  // Tier 5 — red
}

export default function ScoreDisplay({ score: scoreProp, size = 'lg' }: ScoreDisplayProps) {
  const score = Number(scoreProp); // pg returns numeric cols as strings
  const radius = size === 'lg' ? 52 : size === 'md' ? 40 : 28;
  const strokeWidth = size === 'lg' ? 7 : 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2 + 4;
  const center = svgSize / 2;

  const fontSize = size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-lg';
  const labelSize = size === 'lg' ? 'text-xs' : 'text-[10px]';
  const color = getScoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={svgSize} height={svgSize} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        {/* Score arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      {/* Score number in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`${fontSize} font-bold tabular-nums leading-none`}
          style={{ color, fontFamily: 'ui-monospace, "Cascadia Code", monospace' }}
        >
          {score}
        </span>
        {size !== 'sm' && (
          <span className={`${labelSize} text-gray-400 tracking-widest uppercase mt-0.5`}>
            /100
          </span>
        )}
      </div>
    </div>
  );
}
