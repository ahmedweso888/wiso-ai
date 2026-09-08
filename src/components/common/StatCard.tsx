import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "primary" | "accent" | "destructive" | "success";
  className?: string;
}) {
  const toneClass = {
    default: "text-foreground",
    primary: "text-primary",
    accent: "text-accent",
    destructive: "text-destructive",
    success: "text-success",
  }[tone];

  return (
    <div className={cn("surface-panel p-4 sm:p-5", className)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn("num mt-2 font-display text-2xl font-bold sm:text-3xl", toneClass)}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function ProgressRing({
  value,
  size = 132,
  label,
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-secondary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-primary transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="num font-display text-2xl font-bold">{Math.round(clamped)}%</span>
        {label ? <span className="text-xs text-muted-foreground">{label}</span> : null}
      </div>
    </div>
  );
}
