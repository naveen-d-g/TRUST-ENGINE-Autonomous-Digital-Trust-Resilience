import clsx from "clsx"

interface TrustScoreProps {
  value: number
  size?: "sm" | "md" | "lg"
}

export const TrustScore = ({ value, size = "md" }: TrustScoreProps) => {
  const color =
    value >= 80 ? "text-neonGreen drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]"
    : value >= 50 ? "text-neonOrange drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
    : "text-neonRed drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"

  const sizes = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={clsx("font-bold font-mono tracking-tighter transition-colors duration-300", sizes[size], color)}>
        {value.toFixed(0)}
      </div>
      <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Trust Score</span>
    </div>
  )
}
