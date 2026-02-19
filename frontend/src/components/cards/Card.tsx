import clsx from "clsx"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean
  variant?: "default" | "danger" | "success"
}

export const Card = ({ className, children, glow = false, variant = "default", ...props }: CardProps) => {
  return (
    <div
      className={clsx(
        "bg-bgCard rounded-xl border border-gray-800 p-6 transition-all duration-300",
        glow && "shadow-[0_0_15px_-3px_rgba(0,0,0,0.3)] hover:shadow-neon-blue/20",
        variant === "danger" && "border-neonRed/30 shadow-neon-red/10",
        variant === "success" && "border-neonGreen/30 shadow-neon-green/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
