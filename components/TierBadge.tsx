const TIER_CONFIG: Record<
  number,
  { label: string; bg: string; text: string; border: string }
> = {
  1: { label: 'Best in Class', bg: '#1B3A6B', text: '#FFFFFF', border: '#1B3A6B' },
  2: { label: 'Excellent',     bg: '#2563EB', text: '#FFFFFF', border: '#2563EB' },
  3: { label: 'Good',          bg: '#16A34A', text: '#FFFFFF', border: '#16A34A' },
  4: { label: 'Fair',          bg: '#D97706', text: '#FFFFFF', border: '#D97706' },
  5: { label: 'Below Standard',bg: '#DC2626', text: '#FFFFFF', border: '#DC2626' },
};

interface TierBadgeProps {
  tier: number;
  showNumber?: boolean;
  size?: 'sm' | 'md';
}

export default function TierBadge({ tier, showNumber = true, size = 'md' }: TierBadgeProps) {
  const config = TIER_CONFIG[tier] ?? TIER_CONFIG[5];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-semibold tracking-wide ${padding}`}
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {showNumber && (
        <span className="opacity-75 text-[10px] font-bold">TIER {tier}</span>
      )}
      {config.label}
    </span>
  );
}
