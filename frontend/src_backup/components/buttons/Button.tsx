import clsx from "clsx"
import { Loader2 } from "lucide-react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
}

export const Button = ({ 
  className, 
  variant = "primary", 
  size = "md", 
  isLoading, 
  children, 
  disabled,
  ...props 
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bgPrimary"
  
  const variants = {
    primary: "bg-neonBlue text-white hover:bg-blue-600 shadow-lg shadow-neon-blue/20 hover:shadow-neon-blue/40",
    secondary: "bg-bgCard border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white",
    danger: "bg-neonRed text-white hover:bg-red-600 shadow-lg shadow-neon-red/20 hover:shadow-neon-red/40",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5"
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  }

  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        (disabled || isLoading) && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
