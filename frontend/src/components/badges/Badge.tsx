import clsx from "clsx"

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info"
  children: React.ReactNode
  className?: string
}

export const Badge = ({ variant = "default", children, className }: BadgeProps) => {
  const variants = {
    default: "bg-gray-800 text-gray-300 border-gray-700",
    success: "bg-neonGreen/10 text-neonGreen border-neonGreen/20 shadow-[0_0_10px_-4px_rgba(34,197,94,0.5)]",
    warning: "bg-neonOrange/10 text-neonOrange border-neonOrange/20 shadow-[0_0_10px_-4px_rgba(245,158,11,0.5)]",
    danger: "bg-neonRed/10 text-neonRed border-neonRed/20 shadow-[0_0_10px_-4px_rgba(239,68,68,0.5)]",
    info: "bg-neonBlue/10 text-neonBlue border-neonBlue/20 shadow-[0_0_10px_-4px_rgba(59,130,246,0.5)]",
  }

  return (
    <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-semibold border", variants[variant], className)}>
      {children}
    </span>
  )
}
