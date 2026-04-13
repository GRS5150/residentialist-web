interface AwardBadgeProps {
  award: 'recommended' | 'generational' | null;
  size?: 'sm' | 'md';
}

export default function AwardBadge({ award, size = 'md' }: AwardBadgeProps) {
  if (!award) return null;

  const isGenerational = award === 'generational';
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-3 py-1 text-sm gap-1.5';

  if (isGenerational) {
    return (
      <span
        className={`inline-flex items-center rounded font-semibold tracking-wide ${padding}`}
        style={{
          background: 'linear-gradient(135deg, #78350F 0%, #B45309 50%, #78350F 100%)',
          color: '#FEF3C7',
          boxShadow: '0 1px 4px rgba(120,53,15,0.4)',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="opacity-90">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
        </svg>
        Generational
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded font-semibold tracking-wide ${padding}`}
      style={{
        backgroundColor: '#EFF6FF',
        color: '#1D4ED8',
        border: '1px solid #BFDBFE',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-90">
        <path d="M20 6L9 17l-5-5" />
      </svg>
      Recommended
    </span>
  );
}
