// components/ui/ProgressRing.tsx
// Anneau de progression (0 à 100) avec la valeur au centre

export default function ProgressRing({
  value,
  size = 72,
  stroke = 6,
  trackClassName = "stroke-white/20",
  barClassName = "stroke-white",
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  trackClassName?: string;
  barClassName?: string;
  children?: React.ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className={trackClassName} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          className={`${barClassName} transition-[stroke-dashoffset] duration-700 ease-out`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">{children}</span>
    </div>
  );
}
