"use client";

interface MasteryProgressProps {
  current: number;
  max: number;
  level: number;
}

export default function MasteryProgress({ current, max, level }: MasteryProgressProps) {
  const percent = Math.min((current / max) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-foreground font-medium">Level {level}</span>
        <span className="text-sm text-muted-foreground">
          {current.toLocaleString()} / {max.toLocaleString()} XP
        </span>
      </div>
      <div className="w-full h-4 rounded-sm overflow-hidden bg-secondary border border-border">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
